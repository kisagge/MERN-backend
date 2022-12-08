# MERN Basic Project - Back End

기본적인 기능들이 구현된 스타일 신경안쓴 CRUD 프로젝트

## Back-End Stack

Express, Node.js

## Database

MongoDb

## 구현된 기능

### 1. 유저 (user)

회원가입, 로그인, 유저 정보 조회가 있다.
회원가입을 할 때 jwt를 생성해서 관리하는 방식을 채택했으며
refresh token은 사용하지 않았다.
게시글 리스트 조회를 제외한 나머지 method에는 jwt를 사용하여 유저 정보를 가져오는 middle function을 추가했다.

### 2. 게시글 (posts)

게시글 리스트 조회, 게시글 조회, 게시글 생성, 게시글 수정, 게시글 삭제가 있다.
게시글 리스트 조회를 제외한 나머지 method에는 jwt를 사용하여 유저 정보를 가져오는 middle function을 추가했다.

### 3. 댓글 (comments)

게시글을 조회할 때 게시글 id를 사용해서 댓글을 가져온다.
댓글 생성, 삭제, 댓글 리스트 조회가 있다.
