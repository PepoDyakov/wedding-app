package com.weddingapp.api.controller;

import org.springframework.graphql.data.method.annotation.QueryMapping;
import org.springframework.stereotype.Controller;

@Controller
public class HelloQueryController {

    @QueryMapping
    public String hello() {
        return "Wedding app API is running!";
    }
}