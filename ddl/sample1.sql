create table sample1_a (
  i_value integer,
  n_value numeric,
  r_value real,
  t_value text,
  b_value blob
);

create view v_sampe1 as
select b_value as dbx from
sample1_a;

CREATE TABLE SAMPLE1_B (
  I_VALUE INTEGER NOT NULL PRIMARY KEY,
  N_VALUE NUMERIC null,
  R_VALUE REAL not null,
  T_VALUE TEXT NULL,
  B_VALUE BLOB NOT NULL
);

Create Table "Sample1_C" (
  "I_Value" Integer,
  [N_Value] Numeric not null,
  "R_Value" Real,
  `T_Value` Text Not Null,
  "B_Value" Blob,
  PRIMARY KEY("I_Value", "R_Value")
);
/*<ddlsync>
select 1; /+aaa+/
</ddlsync>*/

create table xxx (
  item
);
delete from xxx;
insert into xxx (
  item
) values (
  'item'
);

create table xxx2 AS select * from xxx;

/*<noddlsync>*/
create table xxx4 (/*aaa*/
  col1 text
  ,col2 text
);

insert into xxx4 (col1) values ('val1')
/*</noddlsync>*/
