<?php
if (!defined('APP_INIT')) { http_response_code(403); exit('Direct access denied.'); }

class PropertyService {
    private PDO $db;
    public function __construct(PDO $db) { $this->db = $db; }

    public function getProperties(int $projectId, array $filters = [], int $page = 1, int $perPage = 6): array {
        $page = max(1, $page);
        $perPage = min(max(1, $perPage), 50);
        $offset = ($page - 1) * $perPage;

        $conditions = ['p.project_id = :projectId'];
        $params = [':projectId' => $projectId];

        if (!empty($filters['minPrice'])) { $conditions[] = 'p.price >= :minPrice'; $params[':minPrice'] = (float)$filters['minPrice']; }
        if (!empty($filters['maxPrice'])) { $conditions[] = 'p.price <= :maxPrice'; $params[':maxPrice'] = (float)$filters['maxPrice']; }
        if (!empty($filters['bedrooms'])) { $conditions[] = 'p.bedrooms = :bedrooms'; $params[':bedrooms'] = (int)$filters['bedrooms']; }
        if (!empty($filters['status']))   { $conditions[] = 'p.status = :status'; $params[':status'] = $filters['status']; }

        $where = implode(' AND ', $conditions);

        $countStmt = $this->db->prepare("SELECT COUNT(*) FROM properties p WHERE {$where}");
        $countStmt->execute($params);
        $total = (int) $countStmt->fetchColumn();

        $sql = "SELECT p.id, p.title, p.price, p.area, p.bedrooms, p.bathrooms, p.floor, p.direction, p.description, p.lat, p.lng, p.is_featured, p.status FROM properties p WHERE {$where} ORDER BY p.is_featured DESC, p.price ASC LIMIT :limit OFFSET :offset";
        $stmt = $this->db->prepare($sql);
        foreach ($params as $key => $val) $stmt->bindValue($key, $val);
        $stmt->bindValue(':limit', $perPage, PDO::PARAM_INT);
        $stmt->bindValue(':offset', $offset, PDO::PARAM_INT);
        $stmt->execute();
        $items = $stmt->fetchAll();

        if (!empty($items)) {
            $ids = array_column($items, 'id');
            $placeholders = implode(',', array_fill(0, count($ids), '?'));
            $imgStmt = $this->db->prepare("SELECT property_id, image_url, alt_text FROM property_images WHERE property_id IN ({$placeholders}) ORDER BY sort_order ASC");
            $imgStmt->execute($ids);
            $imageMap = [];
            foreach ($imgStmt->fetchAll() as $img) {
                $imageMap[$img['property_id']][] = ['url' => $img['image_url'], 'altText' => $img['alt_text']];
            }
            foreach ($items as &$item) { $item['images'] = $imageMap[$item['id']] ?? []; }
        }

        return ['items' => $items, 'total' => $total, 'page' => $page, 'perPage' => $perPage, 'totalPages' => (int)ceil($total / $perPage)];
    }
}
