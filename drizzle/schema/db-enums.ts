export const roleEnum = ['Owner', 'Admin', 'Default'] as const;
export type Role = (typeof roleEnum)[number];

export const jobLocationEnum = ['On-Site', 'Remote', 'Hybrid'] as const;
export type JobLocation = (typeof jobLocationEnum)[number];

export const paymentTypeEnum = ['Fixed-Price', 'Milestones'] as const;
export type PaymentType = (typeof paymentTypeEnum)[number];

export const experienceLevelEnum = ['Entry', 'Intermediate', 'Expert'] as const;
export type ExperienceLevel = (typeof experienceLevelEnum)[number];

export const applicationStatusEnum = ['Accepted', 'Rejected', 'Pending'] as const;
export type ApplicationStatus = (typeof applicationStatusEnum)[number];

export const notificationEnum = ['Application Status', 'New Message', 'New Application'] as const;
export type Notification = (typeof notificationEnum)[number];

export const reportSubjectEnum = ['Scamming', 'Inappropriate Name', 'Spam', 'Other'] as const;
export type ReportSubject = (typeof reportSubjectEnum)[number];

export const actionEnum = ['User Deletion', 'Job Deletion', 'Role Updated', 'User Ban'] as const;
export type Action = (typeof actionEnum)[number];
