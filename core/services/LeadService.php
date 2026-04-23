<?php
if (!defined('APP_INIT')) { http_response_code(403); exit('Direct access denied.'); }

class LeadService {
    private PDO $db;
    public function __construct(PDO $db) { $this->db = $db; }

    public function createLead(array $data): int {
        $stmt = $this->db->prepare('INSERT INTO leads (site_id, project_id, name, phone, email, message, source, ip_address, created_at) VALUES (:siteId, :projectId, :name, :phone, :email, :message, :source, :ip, NOW())');
        $stmt->execute([
            ':siteId'    => $data['site_id'],
            ':projectId' => $data['project_id'] ?? null,
            ':name'      => $data['name'],
            ':phone'     => $data['phone'],
            ':email'     => $data['email'] ?? null,
            ':message'   => $data['message'] ?? null,
            ':source'    => $data['source'] ?? 'landing_page',
            ':ip'        => $_SERVER['REMOTE_ADDR'] ?? null,
        ]);
        return (int) $this->db->lastInsertId();
    }
}
