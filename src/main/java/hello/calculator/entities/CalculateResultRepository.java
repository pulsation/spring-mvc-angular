package hello.calculator.entities;

import java.util.List;

import org.springframework.data.repository.CrudRepository;
import org.springframework.data.repository.PagingAndSortingRepository;
import org.springframework.data.repository.query.Param;
import org.springframework.data.rest.core.annotation.RepositoryRestResource;

/**
 * Created by pulsation on 9/25/14.
 */
@RepositoryRestResource(collectionResourceRel="calculateResults", path="results")
public interface CalculateResultRepository extends PagingAndSortingRepository<CalculateResult, Long> {
    List<CalculateResult> findByValue(Double value);
}
