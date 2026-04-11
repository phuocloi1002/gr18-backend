package com.restaurantAi.backend.entity;

import com.restaurantAi.backend.entity.enums.ReservationStatus;
import jakarta.persistence.*;
import lombok.*;
import lombok.experimental.FieldDefaults;

import java.time.LocalDateTime;

@Entity
@Table(name = "reservations")
@Getter
@Setter
@FieldDefaults(level = AccessLevel.PRIVATE)
public class Reservation extends BaseEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    Long id;

    @ManyToOne
    @JoinColumn(name = "user_id")
    User user;

    @ManyToOne
    @JoinColumn(name = "table_id")
    RestaurantTable table;

    LocalDateTime reservationTime;
    Integer numberOfGuests;

    String customerName;
    String customerPhone;
    String note;

    @Enumerated(EnumType.STRING)
    ReservationStatus status;
}
