import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { Bot, Save, Loader2, Sparkles, AlertCircle } from 'lucide-react';
import { getAuth } from "firebase/auth";

export function AIPromptsEditorWidget() {
  const [prompts, setPrompts] = useState<any>({});
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const fetchPrompts = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/ai-prompts");
      const data = await res.json();
      if (data && data.success) {
        setPrompts(data.data || {});
      }
    } catch (err: any) {
      setError(err.message || "Failed to load prompts");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPrompts();
  }, []);

  const handleChange = (key: string, value: string) => {
    setPrompts((prev: any) => ({ ...prev, [key]: value }));
  };

  const handleSave = async () => {
    setSaving(true);
    setError(null);
    setSuccess(null);
    try {
      const auth = getAuth();
      const user = auth.currentUser;
      const idToken = user ? await user.getIdToken() : "";
      const adminKey = localStorage.getItem("henosis_admin_key") || "";

      const res = await fetch("/api/admin/ai-prompts", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": idToken ? `Bearer ${idToken}` : "",
          "x-admin-key": adminKey
        },
        body: JSON.stringify(prompts)
      });
      const data = await res.json();
      if (data.success) {
        setSuccess("Lưu System Prompts thành công! Server đã cập nhật đồng bộ.");
        setTimeout(() => setSuccess(null), 3000);
      } else {
        throw new Error(data.error || "Save failed");
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div className="text-white/50 text-sm flex items-center gap-2"><Loader2 className="w-4 h-4 animate-spin"/> Đang tải Prompt Config...</div>;

  return (
    <div className="bg-slate-800/50 border border-slate-700/50 rounded-xl p-5 mb-8">
      <div className="flex items-center gap-3 mb-4 border-b border-white/10 pb-3">
        <div className="bg-gradient-to-br from-indigo-500 to-purple-500 w-10 h-10 rounded-xl flex items-center justify-center shadow-lg shadow-indigo-500/20">
          <Bot className="w-5 h-5 text-indigo-50" />
        </div>
        <div>
          <h2 className="text-xl font-bold text-white tracking-tight flex items-center gap-2">
            AI Prompts Configuration <Sparkles className="w-4 h-4 text-amber-400" />
          </h2>
          <p className="text-xs text-white/50">Đồng bộ hoá toàn cầu (Global Server Override)</p>
        </div>
      </div>

      {error && (
        <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-3 text-red-400 text-sm flex items-start gap-2 mb-4">
          <AlertCircle className="w-4 h-4 mt-0.5 shrink-0" />
          <p>{error}</p>
        </div>
      )}

      {success && (
         <div className="bg-green-500/10 border border-green-500/20 rounded-lg p-3 text-green-400 text-sm flex items-start gap-2 mb-4">
          <Sparkles className="w-4 h-4 mt-0.5 shrink-0" />
          <p>{success}</p>
        </div>
      )}

      <div className="space-y-6">
        {/* Agent 2 configs */}
        <div className="space-y-4">
          <h3 className="text-indigo-400 font-semibold px-2 border-l-2 border-indigo-400">Agent 2 (Giảng viên / Giải nghĩa)</h3>
          
          <div className="bg-slate-900/50 rounded-lg p-4 border border-white/5 relative group">
            <label className="text-xs font-semibold text-white/70 uppercase tracking-wider mb-2 block">Agent 2 System Core</label>
            <textarea
              className="w-full bg-black/30 border border-white/10 rounded-lg p-3 text-sm text-amber-100 font-mono h-24 focus:outline-none focus:border-indigo-500 transition-colors"
              placeholder="You are a professional educational coach..."
              value={prompts.agent2_system || "You are a professional educational coach. Answer immediately using clean Vietnamese Markdown without conversational introductions."}
              onChange={(e) => handleChange('agent2_system', e.target.value)}
            />
          </div>

          <div className="bg-slate-900/50 rounded-lg p-4 border border-white/5 relative group">
            <label className="text-xs font-semibold text-white/70 uppercase tracking-wider mb-2 block">Agent 2 Câu lệnh giải thích (Fast Mode)</label>
            <p className="text-[10px] text-white/40 mb-2">Biến nội suy: {`{term}`} và {`{definition}`}</p>
            <textarea
              className="w-full bg-black/30 border border-white/10 rounded-lg p-3 text-sm text-sky-100 font-mono h-40 focus:outline-none focus:border-indigo-500 transition-colors"
              placeholder="Giải nghĩa khái niệm {term}..."
              value={prompts.agent2_fast || `Giải nghĩa khái niệm "{term}" (Định nghĩa của người dùng: {definition}).\nYÊU CẦU QUAN TRỌNG NHẤT:\n1. ĐI THẲNG VÀO NỘI DUNG, BỎ QUA MỌI LỜI CHÀO HỎI xã giao hay câu mào đầu.\n2. Dài khoảng tối thiểu 250 chữ, giải thích bản chất súc tích nhưng đầy đủ sinh động, trực quan.\n3. BẮT BUỘC có cấu trúc:\n- Bản chất cốt lõi (1 câu cực gọn).\n- Đi sâu vào chi tiết giải thích bản chất thực sự của khái niệm.\n- 1 Ví dụ minh hoạ thực tế sinh động.\n- NẾU LÀ TIẾNG ANH: Bắt buộc cung cấp loại từ và giải thích cặn kẽ nguồn gốc (etymology) của từ để người học dễ nhớ hơn.\n- Kết bằng câu hỏi gợi mở suy luận.\nChỉ trả ra nội dung (markdown).`}
              onChange={(e) => handleChange('agent2_fast', e.target.value)}
            />
          </div>

          <div className="bg-slate-900/50 rounded-lg p-4 border border-white/5 relative group">
            <label className="text-xs font-semibold text-white/70 uppercase tracking-wider mb-2 block">Agent 2 Câu lệnh Phân tích sâu (Detailed Mode)</label>
            <p className="text-[10px] text-white/40 mb-2">Biến nội suy: {`{term}`} và {`{definition}`}</p>
            <textarea
              className="w-full bg-black/30 border border-white/10 rounded-lg p-3 text-sm text-sky-100 font-mono h-40 focus:outline-none focus:border-indigo-500 transition-colors"
              placeholder="Phân tích khái niệm {term}..."
              value={prompts.agent2_detailed || `Phân tích khái niệm "{term}" (Định nghĩa: {definition}).\nYÊU CẦU QUAN TRỌNG NHẤT:\n1. ĐI THẲNG VÀO NỘI DUNG, BỎ QUA MỌI LỜI CHÀO HỎI xã giao hay câu mào đầu.\n2. Dài khoảng tối thiểu 250 chữ, giải thích bản chất cốt lõi cực kỳ chi tiết, dễ hiểu.\n3. BẮT BUỘC CÁC BƯỚC:\n- Định nghĩa & Bản chất cốt lõi.\n- NẾU LÀ TIẾNG ANH: Bắt buộc cung cấp loại từ và giải thích cặn kẽ nguồn gốc (etymology) của từ để người học có thể nhớ sâu hơn.\n- Mở rộng vấn đề và góc nhìn phân tích.\n- BẮT BUỘC kết thúc bằng 1 câu hỏi gợi mở liên quan đến ứng dụng hoặc tính chất cốt lõi để thúc đẩy học sinh tự suy nghĩ và phát triển kiến thức.\nBọc công thức Toán/Lý/Hóa bằng LaTeX (dấu $ hoặc $$). Chỉ trả ra nội dung (markdown).`}
              onChange={(e) => handleChange('agent2_detailed', e.target.value)}
            />
          </div>
        </div>

        {/* Agent 3 configs */}
        <div className="space-y-4 pt-6 border-t border-white/10">
          <h3 className="text-amber-400 font-semibold px-2 border-l-2 border-amber-400">Agent 3 (Bot Trò Chuyện 2 Tầng)</h3>
          
          <div className="bg-slate-900/50 rounded-lg p-4 border border-white/5 relative group">
            <label className="text-xs font-semibold text-white/70 uppercase tracking-wider mb-2 block">Agent 3 System Core (Tầng 1 - Routing / Phân Vạch)</label>
            <p className="text-[10px] text-white/40 mb-2">Prompt định tuyến, dùng để phân loại ý định người dùng ra các chế độ.</p>
            <textarea
              className="w-full bg-black/30 border border-white/10 rounded-lg p-3 text-sm text-emerald-100 font-mono h-40 focus:outline-none focus:border-amber-500 transition-colors"
              placeholder="Mày là Agent 3 Router..."
              value={prompts.agent3_tier1 || `Mày là Agent 3 Tier 1 Router. Phân tích ngữ cảnh và trả về đúng 1 từ khóa: direct, debate, hoặc socrates.`}
              onChange={(e) => handleChange('agent3_tier1', e.target.value)}
            />
          </div>

          <div className="bg-slate-900/50 rounded-lg p-4 border border-white/5 relative group">
            <label className="text-xs font-semibold text-white/70 uppercase tracking-wider mb-2 block">Agent 3 System Core (Direct Mode)</label>
            <p className="text-[10px] text-white/40 mb-2">Biến nội suy: {`{englishRule}`} và {`{styleGuidance}`}</p>
            <textarea
              className="w-full bg-black/30 border border-white/10 rounded-lg p-3 text-sm text-emerald-100 font-mono h-40 focus:outline-none focus:border-amber-500 transition-colors"
              placeholder="Mày là trợ lý AI..."
              value={prompts.agent3_direct || `Mày là trợ lý AI tên Agent 3 (Direct Robot Mode).\nĐIỀU KHOẢN TỐI THƯỢNG:\n1. XƯNG HÔ "MÀY/TAO": Bắt buộc xưng "tao" và gọi người dùng là "mày". CẤM DÙNG TỪ "bạn", "tôi", "mình", "anh/chị".\n2. TRẢ LỜI TRỰC TIẾP: KHÔNG áp dụng Socratic. KHÔNG hỏi ngược lại người dùng. Đưa trực tiếp câu trả lời ra.\n3. KHÔNG BẮT CHƯỚC LỊCH SỬ NẾU SAI CHẾ ĐỘ. Tự chỉnh lại độ dài/văn phong ngay lập tức.\n4. FORMAT: Dùng LaTeX ($$, $).{englishRule}\n{styleGuidance}`}
              onChange={(e) => handleChange('agent3_direct', e.target.value)}
            />
          </div>

          <div className="bg-slate-900/50 rounded-lg p-4 border border-white/5 relative group">
            <label className="text-xs font-semibold text-white/70 uppercase tracking-wider mb-2 block">Agent 3 System Core (Debate Mode)</label>
            <p className="text-[10px] text-white/40 mb-2">Biến nội suy: {`{englishRule}`} và {`{styleGuidance}`}</p>
            <textarea
              className="w-full bg-black/30 border border-white/10 rounded-lg p-3 text-sm text-emerald-100 font-mono h-40 focus:outline-none focus:border-amber-500 transition-colors"
              placeholder="Mày là trợ lý AI..."
              value={prompts.agent3_debate || `Mày là trợ lý AI tên Agent 3 (Devil's Advocate / Tranh biện Mode).\nĐIỀU KHOẢN TỐI THƯỢNG:\n1. XƯNG HÔ "MÀY/TAO": Bắt buộc xưng "tao" và gọi người dùng là "mày".\n2. ĐÓNG VAI ĐỐI THỦ TRANH LUẬN: Luôn đóng vai phản biện gắt gao. Cấm xuôi theo ý người dùng. Cố tình vạch trần sơ hở tư duy.\n3. BUỘC NGƯỜI DÙNG PHÒNG THỦ: Luôn kết thúc bằng một câu hỏi xoáy, thách thức lập trường hiện tại của người dùng.\n4. FORMAT: Dùng LaTeX ($$, $).{englishRule}\n{styleGuidance}`}
              onChange={(e) => handleChange('agent3_debate', e.target.value)}
            />
          </div>

          <div className="bg-slate-900/50 rounded-lg p-4 border border-white/5 relative group">
            <label className="text-xs font-semibold text-white/70 uppercase tracking-wider mb-2 block">Agent 3 System Core (Socratic Mode)</label>
            <p className="text-[10px] text-white/40 mb-2">Biến nội suy: {`{socraticRule}`}, {`{englishRule}`} và {`{styleGuidance}`}</p>
            <textarea
              className="w-full bg-black/30 border border-white/10 rounded-lg p-3 text-sm text-emerald-100 font-mono h-40 focus:outline-none focus:border-amber-500 transition-colors"
              placeholder="Mày là Agent 3 - Socrates AI Coach..."
              value={prompts.agent3_socrates || `Mày là Agent 3 - Socrates AI Coach.\nQUY TẮC CỐT LÕI:\n1. XƯNG HÔ "MÀY/TAO": Bắt buộc xưng "tao" và gọi người dùng là "mày". Cấm dùng "bạn", "tôi", "mình".\n{socraticRule}\n3. CẤM BẮT CHƯỚC ĐỘ DÀI LỊCH SỬ NẾU HIỆN TẠI YÊU CẦU ĐỘ DÀI KHÁC. Phải tuân theo yêu cầu hiện tại.\n4. FORMAT: Dùng LaTeX.{englishRule}\n{styleGuidance}`}
              onChange={(e) => handleChange('agent3_socrates', e.target.value)}
            />
          </div>
        </div>
      </div>

      <div className="mt-8 pt-6 border-t border-white/10 flex justify-end">
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={handleSave}
          disabled={saving}
          className="flex items-center gap-2 px-6 py-2.5 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed text-white text-sm font-semibold rounded-lg shadow-xl shadow-blue-900/20"
        >
          {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
          Lưu Chỉnh Sửa & Đồng Bộ
        </motion.button>
      </div>
    </div>
  );
}
