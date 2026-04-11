package com.restaurantAi.backend.entity.enums;

public enum OrderStatus {
    PENDING,      // mới đặt
    CONFIRMED,    // staff xác nhận
    PREPARING,    // đang làm
    SERVED,       // đã phục vụ
    COMPLETED,    // thanh toán xong
    CANCELLED
}
