const { GoogleGenerativeAI } = require("@google/generative-ai");

class ConversationGuideService {
  constructor() {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      console.warn(
        "Warning: GEMINI_API_KEY not found in environment variables"
      );
    }
    this.genAI = apiKey ? new GoogleGenerativeAI(apiKey) : null;
  }

  /**
   * Generate conversation guide based on customer data
   * @param {Object} customer - Customer data from database
   * @returns {Promise<Object>} Conversation guide with opening, topics, and closing
   */
  async generateConversationGuide(customer) {
    if (!this.genAI) {
      return this.getFallbackGuide(customer);
    }

    try {
      const model = this.genAI.getGenerativeModel({
        model: "gemini-2.5-pro",
      });

      const prompt = this.buildPrompt(customer);

      const result = await model.generateContent(prompt);
      const response = await result.response;
      const text = response.text();

      // Parse the AI response
      return this.parseAIResponse(text, customer);
    } catch (error) {
      console.error("Error generating conversation guide:", error);
      return this.getFallbackGuide(customer);
    }
  }

  /**
   * Build prompt for Gemini AI
   */
  buildPrompt(customer) {
    return `Kamu adalah asisten perbankan yang membantu sales untuk melakukan percakapan dengan nasabah potensial.

Data Nasabah:
- Nama: ${customer.name || "Tidak tersedia"}
- Usia: ${customer.age} tahun
- Pekerjaan: ${customer.job}
- Status Pernikahan: ${customer.marital}
- Pendidikan: ${customer.education}
- Memiliki Rumah: ${customer.housing === "yes" ? "Ya" : "Tidak"}
- Memiliki Pinjaman: ${customer.loan === "yes" ? "Ya" : "Tidak"}
- Kontak Terakhir: ${customer.contact}
- Durasi Panggilan Terakhir: ${customer.duration} detik
- Skor Prioritas: ${
      customer.score ? (customer.score * 100).toFixed(1) + "%" : "N/A"
    }

Buatlah panduan percakapan dalam format JSON dengan struktur berikut:
{
  "opening": "kalimat pembuka yang personal dan ramah (1-2 kalimat)",
  "topics": [
    "topik 1 yang relevan untuk dibahas",
    "topik 2 yang relevan untuk dibahas",
    "topik 3 yang relevan untuk dibahas"
  ],
  "keyPoints": [
    "poin penting 1 yang perlu ditekankan",
    "poin penting 2 yang perlu ditekankan"
  ],
  "closing": "kalimat penutup yang profesional dan mendorong follow-up (1-2 kalimat)",
  "tips": "tips singkat untuk sales dalam melakukan percakapan dengan nasabah ini"
}

Pastikan:
1. Pembukaan menggunakan nama nasabah jika tersedia
2. Topik disesuaikan dengan profil nasabah (pekerjaan, status rumah, dll)
3. Poin penting fokus pada value proposition yang relevan
4. Penutup mendorong action selanjutnya
5. Tips praktis dan actionable
6. Gunakan bahasa Indonesia yang sopan dan profesional
7. Response harus dalam format JSON valid

Response (JSON only, no markdown):`;
  }

  /**
   * Parse AI response to structured format
   */
  parseAIResponse(text, customer) {
    try {
      // Remove markdown code blocks if present
      let cleanText = text.trim();
      if (cleanText.startsWith("```json")) {
        cleanText = cleanText.replace(/```json\n?/g, "").replace(/```\n?/g, "");
      } else if (cleanText.startsWith("```")) {
        cleanText = cleanText.replace(/```\n?/g, "");
      }

      const parsed = JSON.parse(cleanText);

      return {
        opening: parsed.opening || this.getDefaultOpening(customer),
        topics: parsed.topics || this.getDefaultTopics(customer),
        keyPoints: parsed.keyPoints || this.getDefaultKeyPoints(customer),
        closing: parsed.closing || this.getDefaultClosing(),
        tips: parsed.tips || this.getDefaultTips(customer),
        generatedBy: "ai",
      };
    } catch (error) {
      console.error("Error parsing AI response:", error);
      return this.getFallbackGuide(customer);
    }
  }

  /**
   * Get fallback guide when AI is unavailable
   */
  getFallbackGuide(customer) {
    return {
      opening: this.getDefaultOpening(customer),
      topics: this.getDefaultTopics(customer),
      keyPoints: this.getDefaultKeyPoints(customer),
      closing: this.getDefaultClosing(),
      tips: this.getDefaultTips(customer),
      generatedBy: "fallback",
    };
  }

  getDefaultOpening(customer) {
    const name = customer.name || "Bapak/Ibu";
    return `Selamat ${this.getGreeting()}, ${name}. Terima kasih telah meluangkan waktu untuk berbicara dengan kami hari ini.`;
  }

  getDefaultTopics(customer) {
    const topics = [];

    if (customer.housing === "no") {
      topics.push("Program KPR dengan suku bunga kompetitif");
    }

    if (customer.loan === "no") {
      topics.push("Produk kredit multiguna untuk kebutuhan Anda");
    }

    if (customer.age >= 25 && customer.age <= 45) {
      topics.push("Investasi dan tabungan untuk masa depan");
    }

    if (customer.job.includes("admin") || customer.job.includes("technician")) {
      topics.push("Kemudahan pembayaran dan akses digital banking");
    }

    if (topics.length === 0) {
      topics.push(
        "Produk tabungan dengan bunga menarik",
        "Kemudahan akses digital banking",
        "Program loyalitas nasabah"
      );
    }

    return topics;
  }

  getDefaultKeyPoints(customer) {
    const points = [];

    if (customer.score >= 0.7) {
      points.push("Nasabah prioritas tinggi - tawarkan produk premium");
    } else if (customer.score >= 0.4) {
      points.push("Fokus pada value dan kemudahan proses");
    }

    if (customer.education.includes("university")) {
      points.push("Jelaskan detail produk dan benefit jangka panjang");
    } else {
      points.push("Gunakan bahasa sederhana dan contoh konkret");
    }

    return points;
  }

  getDefaultClosing() {
    return "Apakah ada pertanyaan lain yang bisa saya bantu? Saya siap membantu Anda memilih produk yang paling sesuai dengan kebutuhan.";
  }

  getDefaultTips(customer) {
    if (customer.score >= 0.7) {
      return "Nasabah ini memiliki skor tinggi. Fokus pada relationship building dan tawarkan produk premium dengan benefit eksklusif.";
    } else if (customer.score >= 0.4) {
      return "Nasabah potensial menengah. Tekankan kemudahan proses dan customer service yang responsif.";
    } else {
      return "Dengarkan kebutuhan nasabah dengan baik. Mulai dengan produk entry-level dan bangun kepercayaan.";
    }
  }

  getGreeting() {
    const hour = new Date().getHours();
    if (hour < 12) return "pagi";
    if (hour < 15) return "siang";
    if (hour < 18) return "sore";
    return "malam";
  }
}

module.exports = ConversationGuideService;
