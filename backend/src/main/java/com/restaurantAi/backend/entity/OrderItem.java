package com.restaurantAi.backend.entity;

import com.restaurantAi.backend.entity.enums.OrderItemStatus;
import jakarta.persistence.*;
import lombok.*;
import lombok.experimental.FieldDefaults;

import java.math.BigDecimal;

@Entity
@Table(name = "order_items")
@Getter
@Setter
@FieldDefaults(level = AccessLevel.PRIVATE)
public class OrderItem extends BaseEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    Long id;

    @ManyToOne
    @JoinColumn(name = "order_id")
    Order order;

    @ManyToOne
    @JoinColumn(name = "menu_item_id")
    MenuItem menuItem;

    Integer quantity;
    BigDecimal unitPrice;
    BigDecimal subtotal;

    String note;

    @Enumerated(EnumType.STRING)
    OrderItemStatus status;
}
