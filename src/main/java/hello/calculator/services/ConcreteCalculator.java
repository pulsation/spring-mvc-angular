package hello.calculator.services;

import hello.calculator.services.Calculator;

public class ConcreteCalculator implements Calculator {
    public double square(double x) {
        return x * x;
    }
}