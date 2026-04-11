package com.restaurantAi.backend.entity;

import jakarta.persistence.*;
import lombok.*;
import lombok.experimental.FieldDefaults;

import java.math.BigDecimal;

@Entity
@Table(name = "menu_items")
@Getter
@Setter
@FieldDefaults(level = AccessLevel.PRIVATE)
public class MenuItem extends BaseEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    Long id;

    @ManyToOne
    @JoinColumn(name = "category_id")
    Category category;

    String name;
    String description;
    BigDecimal price;
    String imageUrl;

    Boolean isAvailable;
    Boolean isActive;
    Boolean isDeleted;

    Integer totalSold;
    Double avgRating;
}
