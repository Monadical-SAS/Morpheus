from morpheus_data.database.init_data.roles import user_role, admin_role

morpheus_user = {
    "email": "user@morpheus.com",
    "name": "Morpheus User",
    "roles": [user_role]
}

morpheus_admin = {
    "email": "admin@morpheus.com",
    "name": "Morpheus Admin",
    "roles": [admin_role]
}

all_users = [morpheus_user, morpheus_admin]
