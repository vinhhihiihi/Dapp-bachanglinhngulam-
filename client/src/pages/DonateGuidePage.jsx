import { Link } from "react-router-dom";
import "./DonateGuidePage.css";

const steps = [
  {
    number: "01",
    title: "Kết nối ví",
    description:
      "Mở MetaMask trên trình duyệt, chọn đúng tài khoản và sẵn sàng ký giao dịch khi cần.",
  },
  {
    number: "02",
    title: "Chọn người nhận",
    description:
      "Tìm creator trong danh sách hoặc vào donate nhanh nếu bạn đã có sẵn địa chỉ ví.",
  },
  {
    number: "03",
    title: "Nhập số tiền và gửi",
    description:
      "Xác nhận số tiền muốn ủng hộ, kiểm tra lại địa chỉ ví rồi gửi giao dịch lên blockchain.",
  },
];

const tips = [
  "Chỉ gửi cho địa chỉ ví bạn đã kiểm tra kỹ.",
  "Nên thử số tiền nhỏ trước nếu donate lần đầu.",
  "Chuẩn bị một ít tiền để trả phí gas.",
];

export function DonateGuidePage() {
  return (
    <main className="donate-guide-page">
      <div className="donate-guide-noise" />

      <section className="donate-guide-hero">
        <p className="donate-guide-kicker">Hướng dẫn nhanh</p>
        <h1>Cách donate trên web chỉ trong 3 bước</h1>
        <p className="donate-guide-intro">
          Đây là màn hình đầu tiên cho người mới. Bạn có thể xem cách donate, sau đó
          vào danh sách creator hoặc gửi donate trực tiếp đến một địa chỉ ví bất kỳ.
        </p>

        <div className="donate-guide-actions">
          <Link to="/creators" className="guide-primary-link">
            Vào danh sách creator
          </Link>
          <Link to="/quick-donate" className="guide-secondary-link">
            Donate nhanh
          </Link>
        </div>
      </section>

      <section className="donate-guide-grid">
        <div className="donate-guide-steps">
          {steps.map((step) => (
            <article key={step.number} className="guide-step-card">
              <span>{step.number}</span>
              <h2>{step.title}</h2>
              <p>{step.description}</p>
            </article>
          ))}
        </div>

        <aside className="donate-guide-sidebar">
          <div className="guide-note-card">
            <h2>Khi nào dùng donate nhanh?</h2>
            <p>
              Khi creator chưa có profile trên hệ thống, bạn có thể nhập trực tiếp địa
              chỉ ví người nhận và gửi donate ngay.
            </p>
          </div>

          <div className="guide-note-card">
            <h2>Lưu ý trước khi gửi</h2>
            <ul>
              {tips.map((tip) => (
                <li key={tip}>{tip}</li>
              ))}
            </ul>
          </div>
        </aside>
      </section>
    </main>
  );
}
