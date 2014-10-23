package hello.calculator.entities;

import lombok.Getter;
import lombok.Setter;

import javax.persistence.Entity;
import javax.persistence.GeneratedValue;
import javax.persistence.GenerationType;
import javax.persistence.Id;

/**
 * Created by pulsation on 9/25/14.
 */

@Entity
public class CalculateResult {
    @Id
    @GeneratedValue(strategy= GenerationType.AUTO)
    private long id;

    @Getter
    @Setter
    private Double value;

    @Getter
    @Setter
    private String operation;

    @Override
    public String toString() {
        return String.format("CalculateResult [id=%d, operation=%s, value=%f]", id, operation, value);
    }
}
