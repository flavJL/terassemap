<?php
class Database {
    private $conn;

    public function __construct() {
        try {
            $this->conn = new PDO('sqlite:bars.db');
            $this->conn->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
        } catch(PDOException $e) {
            echo 'Connection failed: ' . $e->getMessage();
        }
    }

    public function getBars() {
        $stmt = $this->conn->prepare('SELECT * FROM bars');
        $stmt->execute();

        return $stmt;
    }

    public function getBar($id) {
        $stmt = $this->conn->prepare('SELECT * FROM bars WHERE id = :id');
        $stmt->execute(['id' => $id]);

        return $stmt;
    }

    public function addBar($name, $description, $lat, $lng, $category) {
        $stmt = $this->conn->prepare('INSERT INTO bars (name, description, lat, lng, category) VALUES (:name, :description, :lat, :lng, :category)');
        $stmt->execute([
            'name' => $name,
            'description' => $description,
            'lat' => $lat,
            'lng' => $lng,
            'category' => $category
        ]);
    }
}
?>
