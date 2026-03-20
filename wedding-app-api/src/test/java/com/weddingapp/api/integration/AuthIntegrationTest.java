package com.weddingapp.api.integration;

import com.weddingapp.api.repository.UserRepository;
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
class AuthIntegrationTest {

  @Autowired
  private HttpGraphQlTester graphQlTester;

  @Autowired
  private UserRepository userRepository;

  @BeforeEach
  void setUp() {
    userRepository.deleteAll();
  }

  @Nested
  @DisplayName("registerUser")
  class RegisterUser {

    @Test
    @DisplayName("should register a new user and return token")
    void shouldRegisterUser() {
      graphQlTester
          .document("""
                  mutation {
                      registerUser(input: {
                          firstName: "John"
                          lastName: "Doe"
                          email: "john@example.com"
                          password: "password123"
                      }) {
                          token
                          user {
                              firstName
                              lastName
                              email
                          }
                      }
                  }
              """)
          .execute()
          .path("registerUser.token").entity(String.class).satisfies(token -> {
            assertNotNull(token);
            assertFalse(token.isEmpty());
          })
          .path("registerUser.user.firstName").entity(String.class).isEqualTo("John")
          .path("registerUser.user.lastName").entity(String.class).isEqualTo("Doe")
          .path("registerUser.user.email").entity(String.class).isEqualTo("john@example.com");

      assertEquals(1, userRepository.count());
    }

    @Test
    @DisplayName("should fail when email already exists")
    void shouldFailWhenEmailExists() {
      // Register first user
      graphQlTester
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
          .execute();

      // Try duplicate
      graphQlTester
          .document("""
                  mutation {
                      registerUser(input: {
                          firstName: "Jane"
                          lastName: "Doe"
                          email: "john@example.com"
                          password: "password456"
                      }) {
                          token
                      }
                  }
              """)
          .execute()
          .errors()
          .satisfy(errors -> {
            assertFalse(errors.isEmpty());
            assertTrue(errors.get(0).getMessage()
                .contains("already exists"));
          });

      assertEquals(1, userRepository.count());
    }
  }

  @Nested
  @DisplayName("loginUser")
  class LoginUser {

    @BeforeEach
    void registerUser() {
      graphQlTester
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
          .execute();
    }

    @Test
    @DisplayName("should login with valid credentials")
    void shouldLogin() {
      graphQlTester
          .document("""
                  mutation {
                      loginUser(input: {
                          email: "john@example.com"
                          password: "password123"
                      }) {
                          token
                          user {
                              firstName
                              email
                          }
                      }
                  }
              """)
          .execute()
          .path("loginUser.token").entity(String.class).satisfies(token -> {
            assertNotNull(token);
            assertFalse(token.isEmpty());
          })
          .path("loginUser.user.firstName").entity(String.class).isEqualTo("John")
          .path("loginUser.user.email").entity(String.class).isEqualTo("john@example.com");
    }

    @Test
    @DisplayName("should fail with wrong password")
    void shouldFailWithWrongPassword() {
      graphQlTester
          .document("""
                  mutation {
                      loginUser(input: {
                          email: "john@example.com"
                          password: "wrongpassword"
                      }) {
                          token
                      }
                  }
              """)
          .execute()
          .errors()
          .satisfy(errors -> {
            assertFalse(errors.isEmpty());
            assertTrue(errors.get(0).getMessage()
                .contains("Invalid email or password"));
          });
    }

    @Test
    @DisplayName("should fail with non-existent email")
    void shouldFailWithWrongEmail() {
      graphQlTester
          .document("""
                  mutation {
                      loginUser(input: {
                          email: "nobody@example.com"
                          password: "password123"
                      }) {
                          token
                      }
                  }
              """)
          .execute()
          .errors()
          .satisfy(errors -> {
            assertFalse(errors.isEmpty());
            assertTrue(errors.get(0).getMessage()
                .contains("Invalid email or password"));
          });
    }
  }
}