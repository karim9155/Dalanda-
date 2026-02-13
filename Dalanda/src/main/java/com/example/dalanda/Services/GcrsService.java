package com.example.dalanda.Services;

import com.example.dalanda.dto.GcrsRequestDto;

import java.io.IOException;

public interface GcrsService {
    byte[] generateCertificate(GcrsRequestDto dto) throws IOException;
}
