package com.restaurantAi.backend.entity;

import jakarta.persistence.*;
import lombok.*;
import lombok.experimental.FieldDefaults;


@Entity
@Table(name = "restaurant_tables")
@Getter
@Setter
@FieldDefaults(level = AccessLevel.PRIVATE)
public class RestaurantTable extends BaseEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    Long id;

    String tableNumber;
    Integer capacity;
    String location;

    @Enumerated(EnumType.STRING)
    TableStatus status;

    String qrCodeUrl;
    String qrCodeToken;

    Boolean isActive;
}
