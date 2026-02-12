package com.autoflex.inventory.exception;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.ControllerAdvice;
import org.springframework.web.bind.annotation.ExceptionHandler;

import java.util.HashMap;
import java.util.Map;

/**
 * Global Exception Handler for the application.
 * Intercepts exceptions thrown by controllers and returns structured JSON responses.
 */
@ControllerAdvice
public class GlobalExceptionHandler {

    /**
     * Handles specific ResourceNotFoundException.
     * Returns 404 Not Found.
     * 
     * @param ex The exception instance
     * @return ResponseEntity with error message
     */
    @ExceptionHandler(ResourceNotFoundException.class)
    public ResponseEntity<Object> handleResourceNotFoundException(ResourceNotFoundException ex) {
        Map<String, Object> body = new HashMap<>();
        body.put("message", ex.getMessage());
        return new ResponseEntity<>(body, HttpStatus.NOT_FOUND);
    }
    
    /**
     * Fallback handler for any other unhandled exceptions.
     * Returns 500 Internal Server Error.
     * 
     * @param ex The exception instance
     * @return ResponseEntity with generic error info
     */
    @ExceptionHandler(Exception.class)
    public ResponseEntity<Object> handleGeneralException(Exception ex) {
        Map<String, Object> body = new HashMap<>();
        body.put("message", "An Internal Server Error occurred");
        body.put("details", ex.getMessage());
        return new ResponseEntity<>(body, HttpStatus.INTERNAL_SERVER_ERROR);
    }
}
