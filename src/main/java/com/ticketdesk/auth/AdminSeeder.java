package com.ticketdesk.auth;

import com.ticketdesk.ticket.Category;
import com.ticketdesk.ticket.Priority;
import com.ticketdesk.ticket.Status;
import com.ticketdesk.ticket.Ticket;
import com.ticketdesk.ticket.TicketRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Profile;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

@Component
@Profile({"local", "h2"})
public class AdminSeeder implements CommandLineRunner {

    private static final Logger log = LoggerFactory.getLogger(AdminSeeder.class);

    private final UserRepository userRepository;
    private final TicketRepository ticketRepository;
    private final PasswordEncoder passwordEncoder;

    @Value("${admin.seed.password:${ADMIN_SEED_PASSWORD:Admin@123}}")
    private String adminPassword;

    public AdminSeeder(UserRepository userRepository, TicketRepository ticketRepository, PasswordEncoder passwordEncoder) {
        this.userRepository = userRepository;
        this.ticketRepository = ticketRepository;
        this.passwordEncoder = passwordEncoder;
    }

    @Override
    public void run(String... args) {
        // 1. Seed Admin
        User admin = userRepository.findByUsername("admin").orElseGet(() -> {
            User u = User.builder()
                    .username("admin")
                    .passwordHash(passwordEncoder.encode(adminPassword))
                    .role(Role.ADMIN)
                    .build();
            return userRepository.save(u);
        });
        log.info("Seeded/Verified ADMIN user 'admin'");

        // 2. Seed Agent
        User agent = userRepository.findByUsername("agent1").orElseGet(() -> {
            User u = User.builder()
                    .username("agent1")
                    .passwordHash(passwordEncoder.encode("Agent@123"))
                    .role(Role.AGENT)
                    .build();
            return userRepository.save(u);
        });
        log.info("Seeded/Verified AGENT user 'agent1'");

        // 3. Seed End-User
        User user = userRepository.findByUsername("user1").orElseGet(() -> {
            User u = User.builder()
                    .username("user1")
                    .passwordHash(passwordEncoder.encode("User@123"))
                    .role(Role.USER)
                    .build();
            return userRepository.save(u);
        });
        log.info("Seeded/Verified USER user 'user1'");

        // 4. Seed Sample Support Tickets if empty
        if (ticketRepository.count() == 0) {
            Ticket t1 = Ticket.builder()
                    .title("VPN connection drops intermittently on Wi-Fi")
                    .description("Whenever connecting from remote home network, Cisco VPN client disconnects every 15 minutes.")
                    .category(Category.NETWORK)
                    .priority(Priority.HIGH)
                    .status(Status.OPEN)
                    .createdBy(user)
                    .build();

            Ticket t2 = Ticket.builder()
                    .title("Laptop battery drain & overheating issue")
                    .description("Dell Latitude 5420 laptop fan runs constantly at 100% speed and battery drops from 100% to 10% in under 1 hour.")
                    .category(Category.HARDWARE)
                    .priority(Priority.CRITICAL)
                    .status(Status.IN_PROGRESS)
                    .createdBy(user)
                    .build();

            Ticket t3 = Ticket.builder()
                    .title("Request access to JIRA project workspace")
                    .description("Please grant Developer read/write permissions to the PaymentGateway project board in JIRA.")
                    .category(Category.ACCESS)
                    .priority(Priority.MEDIUM)
                    .status(Status.RESOLVED)
                    .createdBy(admin)
                    .build();

            ticketRepository.save(t1);
            ticketRepository.save(t2);
            ticketRepository.save(t3);
            log.info("Seeded sample IT support tickets for testing");
        }
    }
}
