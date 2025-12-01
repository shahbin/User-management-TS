/**
 * Validation Utilities
 * Centralized validation logic for user data
 */
import { ValidationError } from "../utils/errors";

export class UserValidator {
  /**
   * Validate email format
   */
  static validateEmail(email: string): void {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      throw new ValidationError("Invalid email format", {
        email: ["Invalid email format"],
      });
    }
  }

  /**
   * Validate password strength
   */
  static validatePassword(password: string): void {
    const errors: string[] = [];

    if (password.length < 8) {
      errors.push("Password must be at least 8 characters");
    }

    if (!/[A-Z]/.test(password)) {
      errors.push("Password must contain an uppercase letter");
    }

    if (!/[0-9]/.test(password)) {
      errors.push("Password must contain a number");
    }

    if (!/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password)) {
      errors.push("Password must contain a special character");
    }

    if (errors.length > 0) {
      throw new ValidationError("Password does not meet requirements", {
        password: errors,
      });
    }
  }

  /**
   * Validate user registration input
   */
  static validateRegisterInput(name: string, email: string, password: string): void {
    const errors: Record<string, string[]> = {};

    if (!name || name.trim().length === 0) {
      errors.name = ["Name is required"];
    }

    if (!email || email.trim().length === 0) {
      errors.email = ["Email is required"];
    }

    if (!password || password.trim().length === 0) {
      errors.password = ["Password is required"];
    }

    if (Object.keys(errors).length > 0) {
      throw new ValidationError("Validation failed", errors);
    }

    // Validate format
    if (email) {
      try {
        this.validateEmail(email);
      } catch (error: any) {
        errors.email = error.errors.email;
      }
    }

    if (password) {
      try {
        this.validatePassword(password);
      } catch (error: any) {
        errors.password = error.errors.password;
      }
    }

    if (Object.keys(errors).length > 0) {
      throw new ValidationError("Validation failed", errors);
    }
  }

  /**
   * Validate login input
   */
  static validateLoginInput(email: string, password: string): void {
    const errors: Record<string, string[]> = {};

    if (!email || email.trim().length === 0) {
      errors.email = ["Email is required"];
    }

    if (!password || password.trim().length === 0) {
      errors.password = ["Password is required"];
    }

    if (Object.keys(errors).length > 0) {
      throw new ValidationError("Validation failed", errors);
    }
  }
}
