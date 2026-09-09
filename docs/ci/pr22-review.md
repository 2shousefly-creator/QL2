# PR #22 — sửa CI và regression fixtures

Rà soát ngày 09/09/2026, branch `codex/cloud-run-production`. PR gốc `11bf2bc`, main đối chiếu `d921682d88378fe4b64aaba9814ec849bab28e38`. Không thay phần Cloud Run production, source gameplay, schema/save hoặc hạ tầng.

## Lỗi gốc và nguồn đối chiếu

- [Phase 6 run 34354262652](https://github.com/2shousefly-creator/QL2/actions/runs/34354262652): checkout cố định `codex/chien-tuyen-phase-6` không còn tồn tại. Workflow còn chứa patch test, commit và push về branch đó, dù PR không liên quan. Workflow complete-pr cũng có cơ chế sửa source tương tự.
- [Phase 5 run 34354262723](https://github.com/2shousefly-creator/QL2/actions/runs/34354262723): dừng ở `armor has canonical level-one stats`. Chạy riêng tất cả 14 file trong `test:chien-tuyen` để tìm các lỗi bị che sau assertion đầu tiên.
- [Main commit c1d5584](https://github.com/2shousefly-creator/QL2/commit/c1d5584df6394e0ef7e66c1948d8c82475b6b9b9) đã chỉnh troopCatalog (base stats, growth và mô tả), nhưng bảng expected chưa cập nhật. Chỉ sửa fixture theo commit đã có trên main, không tính expected bằng cách đọc trực tiếp actual để làm mất tác dụng regression test.

## Fixture được cập nhật

| File test | Fixture cũ | Căn cứ và kiểm tra mới |
| --- | --- | --- |
| domainEngine | Thiết Giáp 1500 HP/40 ATK, nhiều đơn vị/growth cũ; Không Quân Lv2 887 HP | Snapshot số độc lập theo c1d5584: Thiết Giáp 1510/33; Không Quân 950 + 41 = 991; bảng base/growth 18 đơn vị và role Tiên Phong |
| superExpansion | Snapshot Lv54 bảy đơn vị chưa rebalance | Tính bằng base đã duyệt + 53 bước growth; ví dụ Trinh Sát 4071 HP/362 ATK/117.5 DEF; CRIT/SPEED giữ cố định |
| fixed2xActionTurn | Bộ Binh khởi đầu 60 Rage nhưng mong Basic→Ultimate | Main ultimateConfig yêu cầu 60, basic gain 10; test `immediateUltimate` hiện có cũng dùng 50→60→0. Khởi đầu fixture 50, bổ sung assert Rage sau basic và sau chain, vẫn kiểm tra đúng một Action Turn |
| fixed2xActionTurn | Hai lần Quân Y hồi làm HP 500→572 (giả định maxHp 900) | c1d5584 đổi maxHp thành 970: 500 + 2×970×4% = 577.6; xác minh maxHp, dung sai số thực 1e-9, vẫn giữ số sự kiện heal và không heal lặp cuối round |
| superExpansion | Thần Y hồi 18%, Pháp Y cast với 40 Rage | Main ultimateConfig đang là 20% và 50 Rage: 3000×20%×60% = 360, HP 100→460; Pháp Y fixture đủ 50 để thực sự kiểm tra Ultimate thay vì passive |
| uxPolish | Tìm raw aria-describedby và data-quick-finish-confirm trong component cũ | Main `3bbe1cb` chuyển sang `AppModal.describedBy`; `011c532` dùng `ConfirmationDialog`. Test kiểm tra prop→ARIA, ID subtitle, focus/Escape và markup render có role dialog/aria-modal/archetype confirm; giữ callback xác nhận tính phí |

Không cập nhật các test combat đang đúng chỉ vì khác mô tả catalog. Có bất nhất sẵn trên main: Không Quân catalog 5% nhưng `COMBAT_CONFIG.passives.airForceAttackPerStack=0.04`; Công Binh catalog 35% nhưng `engineerReflect=0.50`. Engine hiện dùng combat config. Cả các giá trị và regression test tương ứng giữ nguyên; nếu muốn đồng nhất phải có quyết định cân bằng riêng.

## Workflow

- `phase6-pr-patch.yml`: thay one-off mutation script bằng **Phase 6 Regression Validation**, vẫn giữ check/job `patch`; checkout code PR theo mặc định, `contents: read`, `persist-credentials: false`, Node 24/Bun 1.3.3 frozen install, chạy phase6Update test và bảo đảm không sửa tracked source. Không checkout/push branch legacy, không Python replace gameplay.
- `phase6-complete-pr.yml`: ngừng trigger PR và bỏ toàn bộ source patch; workflow_dispatch chỉ thông báo đã retire, permissions rỗng, không checkout/commit/push.
- `phase5-validation.yml`: giữ toàn bộ Chiến Tuyến suite, lint và legacy build; Node 24/Bun 1.3.3 frozen install khớp web production. Bổ sung `build:web`, `verify:web`, `verify:save-transfer`; quyền read-only. Có workflow_dispatch để chạy kiểm tra chủ động khi cần.
- Không đổi hai workflow push dành riêng branch Phase 6 cũ; chúng không chạy trên PR #22/branch cloud-run-production. Không thay main, repository settings hoặc branch protection.

## Kiểm chứng

- `bun run test:chien-tuyen`: toàn bộ 14 file pass, gồm cả simulation sẵn trong script (40 trận), không thay simulation hoặc assertion để né lỗi.
- `tsc --noEmit`, legacy `build`, `build:web`, `verify:web`, `verify:save-transfer`: pass local với Node 24.19.0/Bun 1.3.3. Legacy build tự sinh public/version.json; sau kiểm tra đã phục hồi đúng bytes trước build, không đưa vào commit.
- Vite còn cảnh báo chunk lớn như trước; không tối ưu/đổi code production trong lần sửa CI.
- Git diff được giới hạn vào ba workflow, bốn test và tài liệu rà soát này; Dockerfile, server web, config/build scripts, save logic và tài liệu production của `11bf2bc` giữ nguyên.
- Push commit lên chính branch PR để GitHub chạy các workflow trên HEAD mới; không rerun mutation workflow ở commit cũ. Trạng thái run GitHub cuối cùng được báo trong bàn giao PR, không đồng nghĩa đã deploy.
