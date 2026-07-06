create table if not exists resumes(
    id serial primary key,
    user_id integer not null references users(id) on delete cascade,
    resume_filename varchar(255) not null,
    resume_url varchar(500) not null,
    created_at timestamp default now()
);