package hello.calculator.controllers;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;
import static org.hamcrest.Matchers.containsString;

import hello.Application;
import org.junit.Before;
import org.junit.Test;
import org.junit.runner.RunWith;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.SpringApplicationConfiguration;
import org.springframework.http.MediaType;
import org.springframework.test.context.junit4.SpringJUnit4ClassRunner;
import org.springframework.test.context.web.WebAppConfiguration;
import org.springframework.test.web.servlet.MockMvc;

import org.springframework.test.web.servlet.setup.MockMvcBuilders;
import org.springframework.web.context.WebApplicationContext;

import java.nio.charset.Charset;

/**
 * Created by pulsation on 9/10/14.
 */


@RunWith(SpringJUnit4ClassRunner.class)
@WebAppConfiguration
@SpringApplicationConfiguration(classes = Application.class)
public class HelloTests {
    private MockMvc mockMvc;

    @Autowired
    WebApplicationContext wac;

    @Before
    public void setup() throws Exception {
        this.mockMvc = MockMvcBuilders.webAppContextSetup(wac).build();
    }

    @Test
    public void responseCalculator() throws Exception {
        this.mockMvc.perform(
                get("/")
                        .accept(new MediaType("text", "plain", Charset.forName("UTF-8"))))
                .andExpect(status().isOk())
        .andExpect(content().string(containsString("<html ng-app=\"calculate\"")));

        this.mockMvc.perform(
                get("/unknown_route")
                        .accept(new MediaType("text", "plain", Charset.forName("UTF-8"))))
                .andExpect(status().isNotFound());

        this.mockMvc.perform(
                post("/partials/square")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"x\":\"5\"}")
                        .accept(new MediaType("text", "plain", Charset.forName("UTF-8"))))
                .andExpect(status().isOk())
                .andExpect(content().string(containsString(">25.00<")));

        this.mockMvc.perform(
                post("/data/calculate-results")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"value\":\"25\",\"operation\":\"5^2\"}"))
                .andExpect(status().isCreated());
    }
}
