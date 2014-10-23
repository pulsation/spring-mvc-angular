package hello.config;

import org.springframework.context.annotation.Configuration;
import org.springframework.context.annotation.Import;
import org.springframework.data.rest.core.config.RepositoryRestConfiguration;
import org.springframework.data.rest.webmvc.config.RepositoryRestMvcConfiguration;

import java.net.URI;
import java.net.URISyntaxException;

/**
 * Created by psamlong on 10/23/14.
 */
@Configuration
@Import(RepositoryRestMvcConfiguration.class)
public class RestDataConfig extends RepositoryRestMvcConfiguration {
    @Override
    protected void configureRepositoryRestConfiguration(RepositoryRestConfiguration config) {
        super.configureRepositoryRestConfiguration(config);
        try {
            config.setBaseUri(new URI("/data"));
        } catch (URISyntaxException e) {
            e.printStackTrace();
        }
    }
}
