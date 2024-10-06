INSERT INTO user (id, email, externalId, createdAt, updatedAt)
VALUES (get_random_uuid(), 'ducen29@gmail.com', '12345678', NOW(), NOW());
ON CONFLICT (email) DO UPDATE SET externalId = '12345678', updatedAt = NOW();

INSERT INTO company 