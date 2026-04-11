package com.restaurantAi.backend.entity;

import jakarta.persistence.*;
import lombok.*;
import lombok.experimental.FieldDefaults;

@Entity
@Table(name = "categories")
@Getter
@Setter
@FieldDefaults(level = AccessLevel.PRIVATE)
public class Category extends BaseEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    Long id;

    String name;
    String description;
    String imageUrl;
    Integer sortOrder;

    Boolean isActive;
    Boolean isDeleted;

    @ManyToOne
    @JoinColumn(name = "created_by", insertable = false, updatable = false)
    User createdByUser;

    @ManyToOne
    @JoinColumn(name = "updated_by", insertable = false, updatable = false)
    User updatedByUser;
}
