package com.weddingapp.api.integration;

import com.weddingapp.api.repository.UserRepository;
import com.weddingapp.api.repository.WeddingRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Nested;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.graphql.tester.AutoConfigureHttpGraphQlTester;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.graphql.test.tester.HttpGraphQlTester;
import org.springframework.test.context.ActiveProfiles;

import static org.junit.jupiter.api.Assertions.*;

@SpringBootTest(webEnvironment = SpringBootTest.WebEnvironment.RANDOM_PORT)
@AutoConfigureHttpGraphQlTester
@ActiveProfiles("test")
class WeddingIntegrationTest {

  @Autowired
  private HttpGraphQlTester graphQlTester;

  @Autowired
  private UserRepository userRepository;

  @Autowired
  private WeddingRepository weddingRepository;

  private String authToken;

  @BeforeEach
  void setUp() {
    weddingRepository.deleteAll();
    userRepository.deleteAll();

    authToken = graphQlTester
        .document("""
                mutation {
                    registerUser(input: {
                        firstName: "John"
                        lastName: "Doe"
                        email: "john@example.com"
                        password: "password123"
                    }) {
                        token
                    }
                }
            """)
        .execute()
        .path("registerUser.token")
        .entity(String.class)
        .get();
  }

  private HttpGraphQlTester authenticatedTester() {
    return graphQlTester.mutate()
        .headers(headers -> headers.setBearerAuth(authToken))
        .build();
  }

  @Nested
  @DisplayName("createWedding")
  class CreateWedding {

    @Test
    @DisplayName("should create wedding with authentication")
    void shouldCreateWedding() {
      authenticatedTester()
          .document("""
                  mutation {
                      createWedding(input: {
                          title: "John & Jane's Wedding"
                          weddingDate: "2026-09-20"
                          venue: "Rose Garden Estate"
                          description: "A beautiful ceremony"
                          customMessage: "Join us!"
                          themeColor: "#e74c3c"
                      }) {
                          id
                          title
                          weddingDate
                          venue
                          description
                          customMessage
                          themeColor
                      }
                  }
              """)
          .execute()
          .path("createWedding.title").entity(String.class).isEqualTo("John & Jane's Wedding")
          .path("createWedding.venue").entity(String.class).isEqualTo("Rose Garden Estate")
          .path("createWedding.themeColor").entity(String.class).isEqualTo("#e74c3c");

      assertEquals(1, weddingRepository.count());
    }

    @Test
    @DisplayName("should fail without authentication")
    void shouldFailWithoutAuth() {
      graphQlTester
          .document("""
                  mutation {
                      createWedding(input: {
                          title: "Wedding"
                          weddingDate: "2026-09-20"
                          venue: "Venue"
                      }) {
                          id
                      }
                  }
              """)
          .execute()
          .errors()
          .satisfy(errors -> {
            assertFalse(errors.isEmpty());
            assertTrue(errors.get(0).getMessage()
                .contains("logged in"));
          });

      assertEquals(0, weddingRepository.count());
    }
  }

  @Nested
  @DisplayName("myWeddings")
  class MyWeddings {

    @Test
    @DisplayName("should return empty list when no weddings")
    void shouldReturnEmptyList() {
      authenticatedTester()
          .document("""
                  {
                      myWeddings {
                          id
                          title
                      }
                  }
              """)
          .execute()
          .path("myWeddings")
          .entityList(Object.class)
          .hasSize(0);
    }

    @Test
    @DisplayName("should return user's weddings")
    void shouldReturnWeddings() {
      // Create two weddings
      authenticatedTester()
          .document("""
                  mutation {
                      createWedding(input: {
                          title: "Wedding 1"
                          weddingDate: "2026-06-15"
                          venue: "Venue 1"
                      }) { id }
                  }
              """)
          .execute();

      authenticatedTester()
          .document("""
                  mutation {
                      createWedding(input: {
                          title: "Wedding 2"
                          weddingDate: "2026-09-20"
                          venue: "Venue 2"
                      }) { id }
                  }
              """)
          .execute();

      authenticatedTester()
          .document("""
                  {
                      myWeddings {
                          id
                          title
                          venue
                      }
                  }
              """)
          .execute()
          .path("myWeddings")
          .entityList(Object.class)
          .hasSize(2);
    }

    @Test
    @DisplayName("should not return other user's weddings")
    void shouldNotReturnOtherUsersWeddings() {
      // Create wedding as John
      authenticatedTester()
          .document("""
                  mutation {
                      createWedding(input: {
                          title: "John's Wedding"
                          weddingDate: "2026-06-15"
                          venue: "Venue"
                      }) { id }
                  }
              """)
          .execute();

      // Register Jane
      String janeToken = graphQlTester
          .document("""
                  mutation {
                      registerUser(input: {
                          firstName: "Jane"
                          lastName: "Smith"
                          email: "jane@example.com"
                          password: "password123"
                      }) {
                          token
                      }
                  }
              """)
          .execute()
          .path("registerUser.token")
          .entity(String.class)
          .get();

      // Query as Jane
      graphQlTester.mutate()
          .headers(headers -> headers.setBearerAuth(janeToken))
          .build()
          .document("""
                  {
                      myWeddings {
                          id
                          title
                      }
                  }
              """)
          .execute()
          .path("myWeddings")
          .entityList(Object.class)
          .hasSize(0);
    }
  }

  @Nested
  @DisplayName("deleteWedding")
  class DeleteWedding {

    @Test
    @DisplayName("should delete own wedding")
    void shouldDeleteOwnWedding() {
      String weddingId = authenticatedTester()
          .document("""
                  mutation {
                      createWedding(input: {
                          title: "To Delete"
                          weddingDate: "2026-06-15"
                          venue: "Venue"
                      }) { id }
                  }
              """)
          .execute()
          .path("createWedding.id")
          .entity(String.class)
          .get();

      authenticatedTester()
          .document("""
                  mutation DeleteWedding($id: ID!) {
                      deleteWedding(id: $id)
                  }
              """)
          .variable("id", weddingId)
          .execute()
          .path("deleteWedding")
          .entity(Boolean.class)
          .isEqualTo(true);

      assertEquals(0, weddingRepository.count());
    }

    @Test
    @DisplayName("should not delete other user's wedding")
    void shouldNotDeleteOtherUsersWedding() {
      // Create wedding as John
      String weddingId = authenticatedTester()
          .document("""
                  mutation {
                      createWedding(input: {
                          title: "John's Wedding"
                          weddingDate: "2026-06-15"
                          venue: "Venue"
                      }) { id }
                  }
              """)
          .execute()
          .path("createWedding.id")
          .entity(String.class)
          .get();

      // Register Jane
      String janeToken = graphQlTester
          .document("""
                  mutation {
                      registerUser(input: {
                          firstName: "Jane"
                          lastName: "Smith"
                          email: "jane@example.com"
                          password: "password123"
                      }) {
                          token
                      }
                  }
              """)
          .execute()
          .path("registerUser.token")
          .entity(String.class)
          .get();

      // Try delete as Jane
      graphQlTester.mutate()
          .headers(headers -> headers.setBearerAuth(janeToken))
          .build()
          .document("""
                  mutation DeleteWedding($id: ID!) {
                      deleteWedding(id: $id)
                  }
              """)
          .variable("id", weddingId)
          .execute()
          .errors()
          .satisfy(errors -> {
            assertFalse(errors.isEmpty());
            assertTrue(errors.get(0).getMessage()
                .contains("permission"));
          });

      assertEquals(1, weddingRepository.count());
    }
  }
}