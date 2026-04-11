package com.restaurantAi.backend.entity;

import com.restaurantAi.backend.entity.enums.CallStatus;
import jakarta.persistence.*;
import lombok.*;
import lombok.experimental.FieldDefaults;

import java.time.LocalDateTime;

@Entity
@Table(name = "call_staffs")
@Getter
@Setter
@FieldDefaults(level = AccessLevel.PRIVATE)
public class CallStaff extends BaseEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    Long id;

    @ManyToOne
    RestaurantTable table;

    @Enumerated(EnumType.STRING)
    CallStatus status;

    @ManyToOne
    @JoinColumn(name = "handled_by")
    User handledBy;

    LocalDateTime handledAt;
}
