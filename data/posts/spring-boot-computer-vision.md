---
id: spring-boot-computer-vision
title: Setting Up Spring Boot for Computer Vision
author: Emin
tags:
  - java
  - spring-boot
  - computer-vision
  - opencv
  - ml
excerpt: How I wired up a Spring Boot backend with OpenCV and got image inference working reliably—what I chose, what broke, and what I’d do again.
---

I set out to get a Java Spring Boot service doing basic computer vision: accept an image, run a simple transform/inference, and return a JSON response. Here’s exactly what I used, what failed the first time, and the shape I’d reuse on the next project.

## Why I picked Spring for this

- I already deploy Spring Boot in other services and like the operational story (packaged jar, health endpoints, config profiles).
- Strong ecosystem for HTTP, validation, and observability; I don’t want to reinvent the service layer just to call into native CV libs.
- Easy to wrap a CV pipeline behind a clean REST API and scale horizontally.

## Dependencies that actually worked

I used the JavaCPP preset for OpenCV so I didn’t have to fiddle with system-level library installs.

```xml
<!-- pom.xml snippets -->
<dependencies>
  <dependency>
    <groupId>org.springframework.boot</groupId>
    <artifactId>spring-boot-starter-web</artifactId>
  </dependency>

  <!-- Brings OpenCV binaries for major platforms via JavaCPP -->
  <dependency>
    <groupId>org.bytedeco</groupId>
    <artifactId>opencv-platform</artifactId>
    <version>4.8.0-1.5.10</version>
  </dependency>

  <!-- Optional: validation + OpenAPI if you like nice docs during dev -->
  <dependency>
    <groupId>org.springframework.boot</groupId>
    <artifactId>spring-boot-starter-validation</artifactId>
  </dependency>
</dependencies>
```

Gradle variant also works (`implementation("org.bytedeco:opencv-platform:4.8.0-1.5.10")`). I’ve found the `-platform` artifact to be the least painful starting point on macOS/Linux CI.

## Minimal controller I started with

This is the smallest slice that proved the end-to-end path: HTTP upload → OpenCV operation → JSON result.

```java
// src/main/java/com/example/vision/VisionController.java
package com.example.vision;

import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import org.bytedeco.opencv.opencv_core.Mat;
import org.bytedeco.opencv.global.opencv_imgcodecs;
import org.bytedeco.opencv.global.opencv_imgproc;

import java.io.IOException;

@RestController
@RequestMapping("/api/vision")
public class VisionController {

  @PostMapping(value = "/edges", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
  public ResponseEntity<?> detectEdges(@RequestParam("image") MultipartFile image) throws IOException {
    byte[] bytes = image.getBytes();

    // Decode JPEG/PNG into Mat
    Mat src = opencv_imgcodecs.imdecode(new Mat(bytes), opencv_imgcodecs.IMREAD_COLOR);
    if (src == null || src.empty()) {
      return ResponseEntity.badRequest().body(new ErrorPayload("Invalid image"));
    }

    // Convert to grayscale and run Canny
    Mat gray = new Mat();
    opencv_imgproc.cvtColor(src, gray, opencv_imgproc.COLOR_BGR2GRAY);
    Mat edges = new Mat();
    opencv_imgproc.Canny(gray, edges, 100, 200);

    // Return simple stats — keeps the response small
    int nonZero = org.bytedeco.opencv.global.opencv_core.countNonZero(edges);
    return ResponseEntity.ok(new EdgeResponse(edges.rows(), edges.cols(), nonZero));
  }

  static class ErrorPayload {
    public final String error;
    ErrorPayload(String error) { this.error = error; }
  }

  static class EdgeResponse {
    public final int height;
    public final int width;
    public final int edgePixels;
    EdgeResponse(int height, int width, int edgePixels) {
      this.height = height; this.width = width; this.edgePixels = edgePixels;
    }
  }
}
```

I prefer JSON summaries for quick health checks. When I actually need the processed image back (preview, debugging), I return a PNG stream from another endpoint and keep this one lightweight.

## Application setup I keep reusing

- `spring-boot-starter-web` for MVC and `MultipartResolver` (built-in since Spring Boot handles it automatically).
- Max upload size in `application.yaml` so I don’t get surprised in prod:

```yaml
spring:
  servlet:
    multipart:
      max-file-size: 10MB
      max-request-size: 10MB
server:
  tomcat:
    max-swallow-size: 10MB
```

## Local run

```bash
mvn spring-boot:run
# or
./gradlew bootRun
```

Test with curl:

```bash
curl -F image=@/path/to/photo.jpg http://localhost:8080/api/vision/edges
```

## Troubles I actually hit (and fixes)

- Native libs not loading on CI: the `opencv-platform` artifact solved it for me. If you ship a slim container, keep the JDK architecture aligned with the preset (arm64 vs x86_64).
- Images decoding as empty `Mat`: usually a content-type or corrupt file issue. I validate that `src.empty()` and return a 400 early.
- Memory growth in loops: reuse `Mat` instances inside batch jobs or let them fall out of scope quickly; don’t hold onto large Mats across requests.

## Scaling the pipeline

For GPU-backed models (ONNX/TensorRT), I keep Spring Boot for the HTTP/control plane and call out to a worker via gRPC or a message queue. For pure OpenCV/cpu-bound filters, horizontal Spring instances behind a reverse proxy worked fine for me. If your model is Python-only, I’ve had success running a lightweight Python microservice and calling it from Spring.

## What I’d do differently next time

- Add a small preview endpoint that returns `image/png` for debugging.
- Wire Micrometer + Prometheus and track average bytes per request and processing time; it helped me catch pathological inputs.
- Keep model/artifact downloads in an init container so pods come up warm.

That’s the setup that got me from zero to “CV over HTTP” quickly with Spring Boot. It’s boring to operate, easy to extend, and future me won’t hate maintaining it.


