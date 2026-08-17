package com.ticketdesk.dashboard.dto;

import com.fasterxml.jackson.annotation.JsonInclude;
import com.ticketdesk.ticket.Priority;
import com.ticketdesk.ticket.Status;

import java.util.Map;

@JsonInclude(JsonInclude.Include.NON_NULL)
public class DashboardSummaryDto {
    private Map<Status, Long> countsByStatus;
    private Map<Priority, Long> countsByPriority;
    private long totalTickets;
    private long openOlderThan48h;

    public DashboardSummaryDto() {
    }

    public DashboardSummaryDto(Map<Status, Long> countsByStatus, Map<Priority, Long> countsByPriority, long totalTickets, long openOlderThan48h) {
        this.countsByStatus = countsByStatus;
        this.countsByPriority = countsByPriority;
        this.totalTickets = totalTickets;
        this.openOlderThan48h = openOlderThan48h;
    }

    public Map<Status, Long> getCountsByStatus() {
        return countsByStatus;
    }

    public void setCountsByStatus(Map<Status, Long> countsByStatus) {
        this.countsByStatus = countsByStatus;
    }

    public Map<Priority, Long> getCountsByPriority() {
        return countsByPriority;
    }

    public void setCountsByPriority(Map<Priority, Long> countsByPriority) {
        this.countsByPriority = countsByPriority;
    }

    public long getTotalTickets() {
        return totalTickets;
    }

    public void setTotalTickets(long totalTickets) {
        this.totalTickets = totalTickets;
    }

    public long getOpenOlderThan48h() {
        return openOlderThan48h;
    }

    public void setOpenOlderThan48h(long openOlderThan48h) {
        this.openOlderThan48h = openOlderThan48h;
    }

    public static Builder builder() {
        return new Builder();
    }

    public static class Builder {
        private Map<Status, Long> countsByStatus;
        private Map<Priority, Long> countsByPriority;
        private long totalTickets;
        private long openOlderThan48h;

        public Builder countsByStatus(Map<Status, Long> countsByStatus) {
            this.countsByStatus = countsByStatus;
            return this;
        }

        public Builder countsByPriority(Map<Priority, Long> countsByPriority) {
            this.countsByPriority = countsByPriority;
            return this;
        }

        public Builder totalTickets(long totalTickets) {
            this.totalTickets = totalTickets;
            return this;
        }

        public Builder openOlderThan48h(long openOlderThan48h) {
            this.openOlderThan48h = openOlderThan48h;
            return this;
        }

        public DashboardSummaryDto build() {
            return new DashboardSummaryDto(countsByStatus, countsByPriority, totalTickets, openOlderThan48h);
        }
    }
}
