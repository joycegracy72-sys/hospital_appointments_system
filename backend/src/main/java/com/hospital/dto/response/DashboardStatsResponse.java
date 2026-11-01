package com.hospital.dto.response;

import java.util.List;

/**
 * KPI stats and analytics for the hospital administration dashboard.
 */
public class DashboardStatsResponse {

    private long totalPatients;
    private long totalDoctors;
    private long totalAppointments;
    private long upcomingAppointmentsCount;
    private long completedAppointmentsCount;
    private long cancelledAppointmentsCount;
    private long todayAppointmentsCount;
    private List<AppointmentDetailResponse> upcomingAppointments;

    public long getTotalPatients() {
        return totalPatients;
    }

    public void setTotalPatients(long totalPatients) {
        this.totalPatients = totalPatients;
    }

    public long getTotalDoctors() {
        return totalDoctors;
    }

    public void setTotalDoctors(long totalDoctors) {
        this.totalDoctors = totalDoctors;
    }

    public long getTotalAppointments() {
        return totalAppointments;
    }

    public void setTotalAppointments(long totalAppointments) {
        this.totalAppointments = totalAppointments;
    }

    public long getUpcomingAppointmentsCount() {
        return upcomingAppointmentsCount;
    }

    public void setUpcomingAppointmentsCount(long upcomingAppointmentsCount) {
        this.upcomingAppointmentsCount = upcomingAppointmentsCount;
    }

    public long getCompletedAppointmentsCount() {
        return completedAppointmentsCount;
    }

    public void setCompletedAppointmentsCount(long completedAppointmentsCount) {
        this.completedAppointmentsCount = completedAppointmentsCount;
    }

    public long getCancelledAppointmentsCount() {
        return cancelledAppointmentsCount;
    }

    public void setCancelledAppointmentsCount(long cancelledAppointmentsCount) {
        this.cancelledAppointmentsCount = cancelledAppointmentsCount;
    }

    public long getTodayAppointmentsCount() {
        return todayAppointmentsCount;
    }

    public void setTodayAppointmentsCount(long todayAppointmentsCount) {
        this.todayAppointmentsCount = todayAppointmentsCount;
    }

    public List<AppointmentDetailResponse> getUpcomingAppointments() {
        return upcomingAppointments;
    }

    public void setUpcomingAppointments(List<AppointmentDetailResponse> upcomingAppointments) {
        this.upcomingAppointments = upcomingAppointments;
    }
}
