CREATE DATABASE IF NOT EXISTS vishanti_petition;

USE vishanti_petition;

CREATE TABLE IF NOT EXISTS complaints (
    complaint_id BIGINT AUTO_INCREMENT PRIMARY KEY,
    title VARCHAR(200) NOT NULL,
    description TEXT NOT NULL,
    category VARCHAR(100) NOT NULL,
    priority ENUM('Low', 'Medium', 'High')
        NOT NULL DEFAULT 'Medium',
    status ENUM(
        'Filed',
        'Assigned',
        'In Review',
        'Resolved',
        'Escalated'
    ) NOT NULL DEFAULT 'Filed',
    is_anonymous BOOLEAN NOT NULL DEFAULT FALSE,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

SHOW TABLES;
DESCRIBE complaints;