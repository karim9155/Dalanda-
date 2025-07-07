package com.example.dalanda.Repositories;

import com.example.dalanda.Entities.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.NativeQuery;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.Optional;
import java.util.UUID;

@Repository
public interface UserRepository extends JpaRepository<User, UUID> {
    Optional<User> findByUsername(String username);
    @NativeQuery("select id from dalandadb.users u where username = :username")
    Optional<UUID> findIdByUsername(@Param("username") String username);
}
