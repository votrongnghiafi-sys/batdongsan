import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of, map } from 'rxjs';

/**
 * Color palette result from AI generation.
 */
export interface AiPalette {
  primaryColor: string;
  secondaryColor: string;
  backgroundColor: string;
  textColor: string;
  accentColor: string;
}

// ---------------------------------------------------------------
// Color math utilities (pure functions)
// ---------------------------------------------------------------

function hexToHsl(hex: string): [number, number, number] {
  hex = hex.replace('#', '');
  if (hex.length === 3) hex = hex.split('').map(c => c + c).join('');
  const r = parseInt(hex.substring(0, 2), 16) / 255;
  const g = parseInt(hex.substring(2, 4), 16) / 255;
  const b = parseInt(hex.substring(4, 6), 16) / 255;

  const max = Math.max(r, g, b), min = Math.min(r, g, b);
  let h = 0, s = 0;
  const l = (max + min) / 2;

  if (max !== min) {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
    switch (max) {
      case r: h = ((g - b) / d + (g < b ? 6 : 0)) / 6; break;
      case g: h = ((b - r) / d + 2) / 6; break;
      case b: h = ((r - g) / d + 4) / 6; break;
    }
  }
  return [Math.round(h * 360), Math.round(s * 100), Math.round(l * 100)];
}

function hslToHex(h: number, s: number, l: number): string {
  h = ((h % 360) + 360) % 360;
  s = Math.max(0, Math.min(100, s)) / 100;
  l = Math.max(0, Math.min(100, l)) / 100;

  const c = (1 - Math.abs(2 * l - 1)) * s;
  const x = c * (1 - Math.abs(((h / 60) % 2) - 1));
  const m = l - c / 2;

  let r = 0, g = 0, b = 0;
  if (h < 60)       { r = c; g = x; b = 0; }
  else if (h < 120) { r = x; g = c; b = 0; }
  else if (h < 180) { r = 0; g = c; b = x; }
  else if (h < 240) { r = 0; g = x; b = c; }
  else if (h < 300) { r = x; g = 0; b = c; }
  else              { r = c; g = 0; b = x; }

  const toHex = (v: number) => Math.round((v + m) * 255).toString(16).padStart(2, '0');
  return `#${toHex(r)}${toHex(g)}${toHex(b)}`;
}

function getContrastTextColor(hex: string): string {
  hex = hex.replace('#', '');
  const r = parseInt(hex.substring(0, 2), 16);
  const g = parseInt(hex.substring(2, 4), 16);
  const b = parseInt(hex.substring(4, 6), 16);
  // Relative luminance
  const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
  return luminance > 0.5 ? '#1a1a2e' : '#f0f0f5';
}

/**
 * AiThemeService — generates color palettes from HEX or uploaded images.
 * Pure client-side for HEX mode, server-side for image extraction.
 */
@Injectable({ providedIn: 'root' })
export class AiThemeService {
  private http = inject(HttpClient);

  // ---------------------------------------------------------------
  // CASE 1: Generate palette from a single HEX color
  // ---------------------------------------------------------------
  generateFromHex(hex: string): Observable<AiPalette> {
    const [h, s, l] = hexToHsl(hex);

    // Primary = the input color
    const primaryColor = hex.toLowerCase();

    // Secondary = complementary hue, slightly desaturated
    const secondaryColor = hslToHex((h + 150) % 360, Math.max(s - 15, 20), Math.min(l + 5, 70));

    // Background = very dark version with slight hue tint
    const backgroundColor = hslToHex(h, Math.min(s, 25), 6);

    // Text = high-contrast against background
    const textColor = getContrastTextColor(backgroundColor);

    // Accent = analogous hue shift, vivid
    const accentColor = hslToHex((h + 30) % 360, Math.min(s + 10, 95), Math.min(l + 10, 65));

    return of({
      primaryColor,
      secondaryColor,
      backgroundColor,
      textColor,
      accentColor,
    });
  }

  // ---------------------------------------------------------------
  // CASE 2: Extract palette from an uploaded image
  // ---------------------------------------------------------------
  generateFromImage(file: File): Observable<AiPalette> {
    const formData = new FormData();
    formData.append('image', file);

    return this.http
      .post<{ success: boolean; data: AiPalette }>('/api/ai/extract-colors.php', formData)
      .pipe(map(res => res.data));
  }

  // ---------------------------------------------------------------
  // Client-side image extraction fallback (Canvas-based)
  // ---------------------------------------------------------------
  extractFromImageClientSide(file: File): Observable<AiPalette> {
    return new Observable(subscriber => {
      const reader = new FileReader();
      reader.onload = (e) => {
        const img = new Image();
        img.onload = () => {
          try {
            const palette = this.extractDominantColors(img);
            subscriber.next(palette);
            subscriber.complete();
          } catch (err) {
            // Fallback to default
            subscriber.next(this.defaultPalette());
            subscriber.complete();
          }
        };
        img.onerror = () => {
          subscriber.next(this.defaultPalette());
          subscriber.complete();
        };
        img.src = e.target?.result as string;
      };
      reader.onerror = () => {
        subscriber.next(this.defaultPalette());
        subscriber.complete();
      };
      reader.readAsDataURL(file);
    });
  }

  private extractDominantColors(img: HTMLImageElement): AiPalette {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d')!;

    // Downscale for performance
    const scale = Math.min(1, 100 / Math.max(img.width, img.height));
    canvas.width = Math.round(img.width * scale);
    canvas.height = Math.round(img.height * scale);
    ctx.drawImage(img, 0, 0, canvas.width, canvas.height);

    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height).data;

    // Simple k-means inspired: bucket colors into hue ranges
    const buckets: Map<number, { r: number; g: number; b: number; count: number }> = new Map();

    for (let i = 0; i < imageData.length; i += 16) { // sample every 4th pixel
      const r = imageData[i];
      const g = imageData[i + 1];
      const b = imageData[i + 2];
      const a = imageData[i + 3];
      if (a < 128) continue; // skip transparent

      // Skip very dark and very light pixels (noise)
      const brightness = (r + g + b) / 3;
      if (brightness < 20 || brightness > 240) continue;

      const [h, s, l] = hexToHsl(
        `#${r.toString(16).padStart(2, '0')}${g.toString(16).padStart(2, '0')}${b.toString(16).padStart(2, '0')}`
      );

      // Skip low-saturation (grays)
      if (s < 10) continue;

      const bucketKey = Math.round(h / 30) * 30; // 12 hue buckets
      const existing = buckets.get(bucketKey);
      if (existing) {
        existing.r += r;
        existing.g += g;
        existing.b += b;
        existing.count++;
      } else {
        buckets.set(bucketKey, { r, g, b, count: 1 });
      }
    }

    // Sort by count descending
    const sorted = [...buckets.entries()]
      .sort((a, b) => b[1].count - a[1].count)
      .slice(0, 5)
      .map(([, bucket]) => {
        const avg = {
          r: Math.round(bucket.r / bucket.count),
          g: Math.round(bucket.g / bucket.count),
          b: Math.round(bucket.b / bucket.count),
        };
        return `#${avg.r.toString(16).padStart(2, '0')}${avg.g.toString(16).padStart(2, '0')}${avg.b.toString(16).padStart(2, '0')}`;
      });

    if (sorted.length === 0) return this.defaultPalette();

    // Map dominant colors to palette roles
    const primary = sorted[0];
    const [ph, ps, pl] = hexToHsl(primary);

    return {
      primaryColor: primary,
      secondaryColor: sorted[1] || hslToHex((ph + 150) % 360, Math.max(ps - 10, 20), Math.min(pl + 5, 65)),
      backgroundColor: hslToHex(ph, Math.min(ps, 20), 6),
      textColor: getContrastTextColor(hslToHex(ph, Math.min(ps, 20), 6)),
      accentColor: sorted[2] || hslToHex((ph + 30) % 360, Math.min(ps + 10, 90), Math.min(pl + 10, 60)),
    };
  }

  private defaultPalette(): AiPalette {
    return {
      primaryColor: '#0A84FF',
      secondaryColor: '#30D158',
      backgroundColor: '#08080f',
      textColor: '#f0f0f5',
      accentColor: '#FF6B35',
    };
  }
}
