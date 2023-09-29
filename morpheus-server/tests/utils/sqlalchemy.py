from sqlalchemy import inspect

def object_as_dict(obj, skip_relationships=False):
    columns_result = {c.key: getattr(obj, c.key)
            for c in inspect(obj).mapper.column_attrs}
    relationships_result = {} if skip_relationships else {c.key: process_relationship(getattr(obj, c.key))
            for c in inspect(obj).mapper.relationships}
    return {**columns_result, **relationships_result}

def process_relationship(relationship):
    print(f"relationship: {relationship}")
    if relationship is None:
        return None
    if isinstance(relationship, list):
        return [object_as_dict(item, True) for item in relationship]
    return object_as_dict(relationship, True)