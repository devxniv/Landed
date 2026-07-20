create table if not exists interview_rounds(
    id serial primary key,
    application_id integer not null references applications(id) on delete cascade,
    round_type varchar(100),
    interview_date date,
    outcome varchar(255),
    notes text,
    created_at timestamp default now()
);