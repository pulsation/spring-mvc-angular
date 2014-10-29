package hello.calculator.entities;

import java.util.List;

import org.springframework.data.repository.CrudRepository;
import org.springframework.data.rest.core.annotation.RepositoryRestResource;

/**
 * Created by pulsation on 9/25/14.
 */
@RepositoryRestResource(collectionResourceRel="calculateResults", path="calculate-results")
public interface CalculateResultRepository extends CrudRepository<CalculateResult, Long> {
    List<CalculateResult> findByValue(Double value);
}
