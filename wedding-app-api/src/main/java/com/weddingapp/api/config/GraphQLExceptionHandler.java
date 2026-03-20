package com.weddingapp.api.config;

import graphql.GraphQLError;
import graphql.schema.DataFetchingEnvironment;
import jakarta.validation.ConstraintViolationException;
import org.springframework.graphql.data.method.annotation.GraphQlExceptionHandler;
import org.springframework.graphql.execution.ErrorType;
import org.springframework.web.bind.annotation.ControllerAdvice;

import java.util.List;
import java.util.stream.Collectors;

@ControllerAdvice
public class GraphQLExceptionHandler {

  @GraphQlExceptionHandler(ConstraintViolationException.class)
  public List<GraphQLError> handleViolation(ConstraintViolationException ex, DataFetchingEnvironment env) {
    return ex.getConstraintViolations().stream()
        .map(violation -> GraphQLError.newError()
            .errorType(ErrorType.BAD_REQUEST)
            .message(violation.getMessage())
            .path(env.getExecutionStepInfo().getPath())
            .location(env.getField().getSourceLocation())
            .build()
        )
        .collect(Collectors.toList());
  }

  @GraphQlExceptionHandler(IllegalArgumentException.class)
  public GraphQLError handleIllegalArgument(IllegalArgumentException ex, DataFetchingEnvironment env) {
    return GraphQLError.newError()
        .errorType(ErrorType.BAD_REQUEST)
        .message(ex.getMessage())
        .path(env.getExecutionStepInfo().getPath())
        .location(env.getField().getSourceLocation())
        .build();
  }

  @GraphQlExceptionHandler(RuntimeException.class)
  public GraphQLError handleRuntime(RuntimeException ex, DataFetchingEnvironment env) {
    return GraphQLError.newError()
        .errorType(ErrorType.INTERNAL_ERROR)
        .message(ex.getMessage())
        .path(env.getExecutionStepInfo().getPath())
        .location(env.getField().getSourceLocation())
        .build();
  }
}
