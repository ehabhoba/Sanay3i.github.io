<?php
class CacheService {
    private $redis;
    private $ttl = 3600; // ساعة واحدة

    public function __construct() {
        $this->redis = new Redis();
        $this->redis->connect('127.0.0.1', 6379);
    }

    public function set($key, $value, $ttl = null) {
        $ttl = $ttl ?? $this->ttl;
        return $this->redis->setex($key, $ttl, serialize($value));
    }

    public function get($key) {
        $value = $this->redis->get($key);
        return $value ? unserialize($value) : null;
    }

    public function delete($key) {
        return $this->redis->del($key);
    }
}
