package com.autoflex.inventory;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;

@SpringBootApplication
/**
 * Main Entry Point for the Autoflex Inventory System Backend.
 * Initializes the Spring Boot application context.
 */
public class InventoryApplication {

    /**
     * Main method to launch the application.
     * @param args Command line arguments.
     */
	public static void main(String[] args) {
		SpringApplication.run(InventoryApplication.class, args);
	}

}
