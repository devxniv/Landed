create table if not exists applications(
    id serial primary key,
    user_id int not null references users(id) on delete cascade,
    company varchar(255) not null,
    role varchar(255) not null,
    resume_id integer references resumes(id) on delete set null,
    source varchar(100),
    applied_date date,
    status varchar(50) not null default 'applied',
    prep_status varchar(50) not null default 'not_started',
    notes text,
    created_at timestamp default now()

);