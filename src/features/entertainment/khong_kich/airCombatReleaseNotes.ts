export const AIR_COMBAT_VERSION = "26.7.1";
export const AIR_COMBAT_RELEASE_NOTES = {
  "version": AIR_COMBAT_VERSION,
  "title": "Chi tiết cập nhật 26.7.1",
  "summary": "Phiên bản 26.7.1 tập trung hoàn thiện trải nghiệm Không Kích sau bản đại tu Magnetic Storm: Màn 2 trở nên nguy hiểm và uy lực hơn, Tinh Anh và Tempest Crown có các chuỗi tấn công khó hơn, hiệu ứng chiến đấu được nâng cấp, giao diện chuyển cảnh mượt hơn và toàn bộ 148 Lõi Nâng Cấp được rà soát lại để mỗi lựa chọn đều có giá trị rõ rệt.",
  "sections": [
    {
      "title": "CÂN BẰNG MÀN 2",
      "body": "Quái vật Màn 2 giờ được chuẩn hóa bằng chỉ số riêng thay vì phụ thuộc vào hệ số nhân theo màn. Các đơn vị cùng bậc tại Magnetic Storm có khả năng chống chịu nhỉnh hơn Màn 1 nhưng vẫn giữ nhịp chiến đấu nhanh.\n\n```text\nHP quái cùng bậc          ≈ +10%\nGiáp quái cùng bậc        ≈ +10%\nStage stat multiplier     Đã loại bỏ\nWave progression          Giữ nguyên\n```"
    },
    {
      "title": "ĐẠN & HITBOX",
      "body": "Đạn của toàn bộ quái vật Màn 2, bao gồm Tinh Anh, Boss và Satellite, được tăng kích thước để các pattern nguy hiểm rõ ràng và tạo áp lực né tránh lớn hơn.\n\n```text\nKích thước đạn            +40%\nHitbox đạn                +40%\nSát thương do tăng size   Không đổi\n```"
    },
    {
      "title": "HIỆU ỨNG CHIẾN ĐẤU",
      "body": "Bom, vụ nổ, kỹ năng từ trường và các đòn đánh nặng đã được nâng cấp hiệu ứng để tạo cảm giác va chạm mạnh hơn. Mine Seeder giờ có vụ nổ nhiều lớp, shockwave, sparks, residue và rung màn hình rõ rệt hơn.\n\n```text\nExplosion VFX             Nâng cấp\nShockwave                 Nâng cấp\nScreen Shake              Tăng cường\nMagnetic Skill VFX        Nâng cấp\nTelegraph kỹ năng         Làm rõ\n```\n\nVòng hitbox trắng từng xuất hiện quanh chiến đấu cơ khi điều khiển đã được ẩn. Các vòng tròn generic quanh quái cũng được thay bằng telegraph phù hợp với từng loại hành động."
    },
    {
      "title": "TINH ANH MAGNETIC STORM",
      "body": "Cyclone Ace và Grid Architect được nâng cấp để phối hợp và kiểm soát chiến trường mạnh hơn thay vì chỉ dùng các kỹ năng rời rạc.\n\n```text\nCyclone Dash              Nâng cấp thành chuỗi nhiều lượt\nTri-Cyclone               Tăng phối hợp\nReversal Pressure         Tăng\nGrid Shift                Bổ sung\nGrid Sweep                Nâng cấp\nProjectile Pressure       Tăng\n```\n\nCác kỹ năng nguy hiểm vẫn có cảnh báo rõ và luôn duy trì đường né hợp lệ."
    },
    {
      "title": "TEMPEST CROWN",
      "body": "Tempest Crown giờ kết hợp các kỹ năng thành những chuỗi tấn công liên tục. Crown Lattice, Polarity, Reversal Blades, Flux Bombardment, Event Horizon, Satellite Hunt và Magnetic Guillotine có nhiều tương tác hơn trong từng phase.\n\n```text\nAttack Phrase             Nâng cấp\nSkill Combination         Tăng mạnh\nPhase Pressure            Tăng\nMoving Safe Corridor      Bổ sung\nTempest Overload          Nâng cấp\n```\n\nFinale Tempest Overload được rút ngắn khoảng nghỉ giữa các cơ chế, tạo một chuỗi sinh tồn liên tục trước khi weakpoint của Boss lộ ra."
    },
    {
      "title": "CÂN BẰNG LÕI NÂNG CẤP",
      "body": "Toàn bộ **148 Lõi Nâng Cấp** đã được rà soát. **73 Lõi** được điều chỉnh để giảm khoảng cách sức mạnh giữa các lựa chọn, giúp những hướng build khác nhau đều có lý do để sử dụng.\n\nMột số thay đổi đáng chú ý:\n\n```text\nChậm mà chắc\n+8 Hỏa Lực cho mỗi 0,1 Tốc Độ Bắn vượt 1,2/s\n\nNghịch Lý Bạo Kích\nKhóa Tỷ Lệ Chí Mạng: 25%\nSát Thương Chí Mạng: +140%\n\nLưỡi Hái Tử Thần\nKết liễu Quái thường: 12% HP\nKết liễu Tinh Anh:    10% HP\nKết liễu Boss:         8% HP\n\nSóng Xung Kích\nChoáng mọi mục tiêu: 4 giây\n\nBão Sét Bạo Kích\nTỷ Lệ Chí Mạng: +25%\nHiệu ứng sét lan: Giữ nguyên\n\nĐạn Siêu Âm\nTốc độ đạn: +100%\nSát thương bắn thường: +4%\n\nPháo Đổi Giáp\nHỏa Lực: +48\nGiáp: -24\n```\n\nCác Lõi yếu được tăng giá trị, các Lõi quá áp đảo được điều chỉnh lại và các Lõi tình huống tiếp tục mạnh nhất khi được dùng đúng build hoặc đúng hoàn cảnh."
    },
    {
      "title": "GIAO DIỆN & TRẢI NGHIỆM",
      "body": "Các chuyển cảnh và popup của Không Kích được làm mượt hơn để giảm cảm giác xuất hiện đột ngột.\n\n```text\nGiải Trí -> Không Kích       Nâng cấp\nMain Menu -> Chọn màn        Nâng cấp\nChọn màn -> Chọn chiến cơ    Nâng cấp\nDanh sách Lõi                Nâng cấp\nTạm dừng / Tooltip           Nâng cấp\n```\n\nMain Menu giờ có thêm nút **Chi tiết cập nhật** để xem những thay đổi của phiên bản mới nhất ngay trong game."
    }
  ]
} as const;
