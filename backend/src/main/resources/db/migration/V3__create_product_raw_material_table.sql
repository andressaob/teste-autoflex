CREATE TABLE product_raw_material (
    id BIGSERIAL PRIMARY KEY,
    product_id BIGINT NOT NULL,
    raw_material_id BIGINT NOT NULL,
    quantity DECIMAL(15,4) NOT NULL,
    CONSTRAINT fk_product FOREIGN KEY (product_id) REFERENCES product(id) ON DELETE CASCADE,
    CONSTRAINT fk_raw_material FOREIGN KEY (raw_material_id) REFERENCES raw_material(id) ON DELETE CASCADE,
    CONSTRAINT uq_product_raw_material UNIQUE (product_id, raw_material_id)
);
