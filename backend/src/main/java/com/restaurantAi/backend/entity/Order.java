package com.restaurantAi.backend.entity;

import com.restaurantAi.backend.entity.enums.CustomerType;
import com.restaurantAi.backend.entity.enums.OrderStatus;
import jakarta.persistence.*;
import lombok.*;
import lombok.experimental.FieldDefaults;

import java.math.BigDecimal;

@Entity
@Table(name = "orders")
@Getter
@Setter
@FieldDefaults(level = AccessLevel.PRIVATE)
public class Order extends BaseEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    Long id;

    @ManyToOne
    @JoinColumn(name = "table_id")
    RestaurantTable table;

    @ManyToOne
    @JoinColumn(name = "user_id")
    User user;

    @ManyToOne
    @JoinColumn(name = "reservation_id")
    Reservation reservation;

    @Enumerated(EnumType.STRING)
    CustomerType customerType;

    String guestName;

    @Enumerated(EnumType.STRING)
    OrderStatus status;

    BigDecimal totalAmount;

    String note;
}
