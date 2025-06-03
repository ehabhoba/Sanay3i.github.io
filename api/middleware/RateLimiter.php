<?php
class RateLimiter {
    private $redis;
    private $maxRequests = 100; // الحد الأقصى للطلبات
    private $timeWindow = 3600; // نافذة زمنية (ساعة)

    public function __construct() {
        $this->redis = new Redis();
        $this->redis->connect('127.0.0.1', 6379);
    }

    public function check($ip) {
        $key = "rate_limit:$ip";
        $requests = $this->redis->get($key);

        if (!$requests) {
            $this->redis->setex($key, $this->timeWindow, 1);
            return true;
        }

        if ($requests >= $this->maxRequests) {
            return false;
        }

        $this->redis->incr($key);
        return true;
    }
}
