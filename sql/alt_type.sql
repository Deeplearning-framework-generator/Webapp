alter table "type"
add column code VARCHAR(255)

update "type" 
set code = 'nn.Module'
where "name" = 'module';

update "type" 
set code = 'Dataset'
where "name" = 'dataset';