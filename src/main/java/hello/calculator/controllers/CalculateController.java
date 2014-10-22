package hello.calculator.controllers;

import hello.calculator.services.Calculator;
import hello.calculator.classes.Operands;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestMethod;


/**
 * Created by pulsation on 9/24/14.
 */
@Slf4j
@Controller
public class CalculateController {
    @Autowired
    Calculator calculator;

    @RequestMapping(value = "/", method = RequestMethod.GET)
    public String calculate(Model model) {
        model.addAttribute("result", 0);
        return "calculate";
    }

    @RequestMapping(value = "/partials/square", method = RequestMethod.POST, consumes = MediaType.APPLICATION_JSON_VALUE)
    public String square(@RequestBody Operands operands, Model model) {
        double result = 0;
        if (operands.getX() != null) {
            if (null == operands.getX()) {
                result = 0;
            } else {
                result = calculator.square(operands.getX());
            }
        }

        log.info("info " + operands.getX());

        model.addAttribute("result", result);
        return "calculate :: #result";
    }
}

