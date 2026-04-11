package com.restaurantAi.backend.entity;

import com.restaurantAi.backend.entity.enums.SenderType;
import jakarta.persistence.*;
import lombok.*;
import lombok.experimental.FieldDefaults;

@Entity
@Table(name = "chatbot_messages")
@Getter
@Setter
@FieldDefaults(level = AccessLevel.PRIVATE)
public class ChatbotMessage extends BaseEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    Long id;

    @ManyToOne
    User user;

    @ManyToOne
    MenuItem menuItem;

    String sessionId;

    @Enumerated(EnumType.STRING)
    SenderType sender;

    String message;

    String intent;
    Double confidence;

    @Column(columnDefinition = "JSON")
    String metadata;
}
