import WidgetKit
import SwiftUI

struct QuoteEntry: TimelineEntry {
    let date: Date
    let id: String?
    let text: String
    let author: String?
    let background: Color
    let foreground: Color
    let deepLinkURL: URL?
    let contentType: String? // "quote" | "affirmation" — kullanıcı onboarding tercihine göre
}

struct Provider: TimelineProvider {
    func placeholder(in context: Context) -> QuoteEntry {
        let placeholderTexts = [
            "Loading inspiration...",
            "Finding wisdom...",
            "Preparing quote...",
            "Stay inspired...",
            "Loading quote..."
        ]
        
        let randomText = placeholderTexts.randomElement() ?? "Stay inspired."
        print("📱 Widget: Placeholder gösteriliyor - \(randomText)")
        
        // Lock screen widget'ları için daha kısa placeholder
        let displayText: String
        if #available(iOSApplicationExtension 16.0, *) {
            if context.family == .accessoryInline || context.family == .accessoryCircular {
                displayText = "Stay inspired"
            } else if context.family == .accessoryRectangular {
                displayText = "Loading inspiration..."
            } else {
                displayText = randomText
            }
        } else {
            displayText = randomText
        }
        
        return QuoteEntry(
            date: Date(),
            id: nil,
            text: displayText,
            author: nil,
            background: Color(UIColor.systemBackground),
            foreground: Color(UIColor.label),
            deepLinkURL: nil,
            contentType: nil
        )
    }

    func getSnapshot(in context: Context, completion: @escaping (QuoteEntry) -> ()) {
        let entry = loadEntry()
        print("📱 Widget: Snapshot oluşturuluyor - \(entry.text.prefix(30))...")
        completion(entry)
    }

    func getTimeline(in context: Context, completion: @escaping (Timeline<QuoteEntry>) -> ()) {
        let entry = loadEntry()
        
        // Widget'ı daha sık güncelle (1 saat yerine 30 dakika)
        let nextRefresh = Calendar.current.date(byAdding: .minute, value: 30, to: Date()) ?? Date().addingTimeInterval(1800)
        
        print("📱 Widget: Timeline oluşturuluyor - sonraki güncelleme: \(nextRefresh)")
        
        completion(Timeline(entries: [entry], policy: .after(nextRefresh)))
    }

    private func loadEntry() -> QuoteEntry {
        let groupId = "group.com.quotespark.dailyinspiration"
        var text = "Stay inspired."
        var author: String? = nil
        var id: String? = nil
        var background = Color(UIColor.systemBackground)
        var foreground = Color(UIColor.label)
        var deepLink: URL? = nil
        var contentType: String? = nil

        if let defaults = UserDefaults(suiteName: groupId) {
            print("📱 Widget: App Group bulundu: \(groupId)")

            if let jsonString = defaults.string(forKey: "widgetQuote") {
                print("📱 Widget: JSON string bulundu, uzunluk: \(jsonString.count)")

                if let data = jsonString.data(using: .utf8) {
                    do {
                        if let dict = try JSONSerialization.jsonObject(with: data) as? [String: Any] {

                            // Log widget data for debugging
                            print("📱 Widget: JSON data loaded - \(dict)")

                            text = dict["text"] as? String ?? text
                            author = dict["author"] as? String
                            id = dict["id"] as? String
                            contentType = dict["type"] as? String

                            if let bgHex = dict["bg"] as? String {
                                background = Color(hex: bgHex)
                                print("🎨 Widget: Background color set to \(bgHex)")
                            }
                            if let fgHex = dict["fg"] as? String {
                                foreground = Color(hex: fgHex)
                                print("🎨 Widget: Foreground color set to \(fgHex)")
                            }

                            print("📱 Widget: Content loaded - ID: \(id ?? "nil"), Type: \(contentType ?? "quote"), Text: \(text.prefix(30))..., Author: \(author ?? "nil")")
                        } else {
                            print("⚠️ Widget: JSON parsing failed - dict is nil")
                        }
                    } catch {
                        print("❌ Widget: JSON parsing error: \(error)")
                    }
                } else {
                    print("⚠️ Widget: JSON string to data conversion failed")
                }
            } else {
                print("⚠️ Widget: 'widgetQuote' key not found in App Group")
            }
        } else {
            print("❌ Widget: App Group not found: \(groupId)")
        }

        if let id = id, let url = URL(string: "quote://quote-detail/\(id)") {
            deepLink = url
            print("🔗 Widget: Deep link created for quote \(id)")
        } else {
            print("⚠️ Widget: Deep link creation failed for ID: \(id ?? "nil")")
        }

        return QuoteEntry(
            date: Date(),
            id: id,
            text: text,
            author: author,
            background: background,
            foreground: foreground,
            deepLinkURL: deepLink,
            contentType: contentType
        )
    }
}

struct QuoteWidgetEntryView : View {
    var entry: Provider.Entry
    @Environment(\.widgetFamily) var family

    @ViewBuilder
    var body: some View {
        // Lock screen widget'ları için özel görünümler
        if #available(iOSApplicationExtension 16.0, *) {
            switch family {
            case .accessoryRectangular:
                LockScreenRectangularView(entry: entry)
            case .accessoryCircular:
                LockScreenCircularView(entry: entry)
            case .accessoryInline:
                LockScreenInlineView(entry: entry)
            case .systemSmall, .systemMedium, .systemLarge:
                HomeScreenView(entry: entry)
            @unknown default:
                HomeScreenView(entry: entry)
            }
        } else {
            HomeScreenView(entry: entry)
        }
    }
    
    // Home screen widget görünümü (mevcut kod)
    @ViewBuilder
    private func HomeScreenView(entry: Provider.Entry) -> some View {
        let isAffirmation = entry.contentType == "affirmation"
        let padding = getPadding()

        let content = ZStack(alignment: .topLeading) {
            entry.background
                .ignoresSafeArea()

            VStack(alignment: .leading, spacing: getSpacing()) {
                // İçerik tipi badge'i — sadece affirmation'da göster
                if isAffirmation {
                    HStack(spacing: 3) {
                        Image(systemName: "sparkles")
                            .font(.system(size: 8, weight: .semibold))
                        Text("Affirmation")
                            .font(.system(size: 9, weight: .semibold))
                    }
                    .foregroundColor(entry.foreground.opacity(0.85))
                    .padding(.horizontal, 7)
                    .padding(.vertical, 3)
                    .background(entry.foreground.opacity(0.18))
                    .cornerRadius(8)
                }

                Text(entry.text)
                    .font(getQuoteFont())
                    .fontWeight(.semibold)
                    .foregroundColor(entry.foreground)
                    .lineLimit(getLineLimit())
                    .minimumScaleFactor(0.7)
                    .multilineTextAlignment(.leading)

                if let author = entry.author, !author.isEmpty {
                    Spacer(minLength: 4)
                    Text("— \(author)")
                        .font(getAuthorFont())
                        .foregroundColor(entry.foreground.opacity(0.8))
                        .lineLimit(1)
                        .minimumScaleFactor(0.8)
                }
            }
            .padding(padding)
        }

        if #available(iOSApplicationExtension 17.0, *) {
            content
                .containerBackground(for: .widget) { entry.background }
                .widgetURL(entry.deepLinkURL)
        } else {
            content
                .widgetURL(entry.deepLinkURL)
        }
    }
    
    private func getQuoteFont() -> Font {
        switch family {
        case .systemSmall:
            return .system(size: 16, weight: .semibold)
        case .systemMedium:
            return .system(size: 18, weight: .semibold)
        case .systemLarge:
            return .system(size: 20, weight: .semibold)
        default:
            return .system(size: 18, weight: .semibold)
        }
    }
    
    private func getAuthorFont() -> Font {
        switch family {
        case .systemSmall:
            return .system(size: 12, weight: .medium)
        case .systemMedium:
            return .system(size: 14, weight: .medium)
        case .systemLarge:
            return .system(size: 16, weight: .medium)
        default:
            return .system(size: 14, weight: .medium)
        }
    }
    
    private func getLineLimit() -> Int {
        switch family {
        case .systemSmall:
            return 3
        case .systemMedium:
            return 4
        case .systemLarge:
            return 6
        default:
            return 4
        }
    }
    
    private func getSpacing() -> CGFloat {
        switch family {
        case .systemSmall:
            return 3
        case .systemMedium:
            return 4
        case .systemLarge:
            return 6
        default:
            return 4
        }
    }
    
    private func getPadding() -> CGFloat {
        switch family {
        case .systemSmall:
            return 10
        case .systemMedium:
            return 12
        case .systemLarge:
            return 16
        default:
            return 12
        }
    }
}

@main
struct QuoteWidget: Widget {
    let kind: String = "QuoteWidget"

    var body: some WidgetConfiguration {
        let config = StaticConfiguration(kind: kind, provider: Provider()) { entry in
            QuoteWidgetEntryView(entry: entry)
        }
        .configurationDisplayName("Aurora")
        .description("Shows your favorite quotes or random inspiration. Updates automatically and with theme changes.")
        
        if #available(iOSApplicationExtension 16.0, *) {
            return config.supportedFamilies([
                .systemSmall, 
                .systemMedium, 
                .systemLarge,
                .accessoryRectangular,
                .accessoryCircular,
                .accessoryInline
            ])
        } else {
            return config.supportedFamilies([.systemSmall, .systemMedium, .systemLarge])
        }
    }
}

// MARK: - Lock Screen Widget Views
@available(iOSApplicationExtension 16.0, *)
struct LockScreenRectangularView: View {
    var entry: Provider.Entry
    
    var body: some View {
        VStack(alignment: .leading, spacing: 3) {
            Text(entry.text)
                .font(.system(size: 13, weight: .medium, design: .rounded))
                .foregroundColor(.primary)
                .lineLimit(2)
                .minimumScaleFactor(0.75)
            
            if let author = entry.author, !author.isEmpty {
                Text("— \(author)")
                    .font(.system(size: 10, weight: .regular, design: .rounded))
                    .foregroundColor(.secondary)
                    .lineLimit(1)
            }
        }
        .widgetURL(entry.deepLinkURL)
    }
}

@available(iOSApplicationExtension 16.0, *)
struct LockScreenCircularView: View {
    var entry: Provider.Entry
    
    var body: some View {
        ZStack {
            // Dairesel widget için arka plan
            if #available(iOSApplicationExtension 16.0, *) {
                AccessoryWidgetBackground()
            }
            
            VStack(spacing: 1) {
                // İlk harf veya kısa metin
                Text(String(entry.text.prefix(1)).uppercased())
                    .font(.system(size: 22, weight: .bold, design: .rounded))
                    .foregroundColor(.primary)
                
                // Kısa metin varsa göster
                if entry.text.count > 1 {
                    Text(String(entry.text.prefix(2)).uppercased())
                        .font(.system(size: 9, weight: .semibold, design: .rounded))
                        .foregroundColor(.secondary)
                }
            }
        }
        .widgetURL(entry.deepLinkURL)
    }
}

@available(iOSApplicationExtension 16.0, *)
struct LockScreenInlineView: View {
    var entry: Provider.Entry
    
    var body: some View {
        Label {
            Text(entry.text)
                .font(.system(size: 13, weight: .medium, design: .rounded))
                .foregroundColor(.primary)
                .lineLimit(1)
                .minimumScaleFactor(0.75)
        } icon: {
            Image(systemName: entry.contentType == "affirmation" ? "sparkles" : "quote.bubble.fill")
                .font(.system(size: 11, weight: .medium))
                .foregroundColor(.primary)
        }
        .widgetURL(entry.deepLinkURL)
    }
}

// MARK: - Utilities
extension Color {
    init(hex: String) {
        let hexSanitized = hex.trimmingCharacters(in: CharacterSet.alphanumerics.inverted)
        var int: UInt64 = 0
        Scanner(string: hexSanitized).scanHexInt64(&int)
        let a, r, g, b: UInt64
        switch hexSanitized.count {
        case 3: // RGB (12-bit)
            (a, r, g, b) = (255, (int >> 8) * 17, (int >> 4 & 0xF) * 17, (int & 0xF) * 17)
        case 6: // RGB (24-bit)
            (a, r, g, b) = (255, int >> 16, int >> 8 & 0xFF, int & 0xFF)
        case 8: // ARGB (32-bit)
            (a, r, g, b) = (int >> 24, int >> 16 & 0xFF, int >> 8 & 0xFF, int & 0xFF)
        default:
            // Geçersiz hex format için varsayılan renkler
            print("⚠️ Widget: Geçersiz hex format: \(hex), varsayılan renk kullanılıyor")
            (a, r, g, b) = (255, 0, 0, 0)
        }
        
        let red = Double(r) / 255
        let green = Double(g) / 255
        let blue = Double(b) / 255
        let opacity = Double(a) / 255
        
        print("🎨 Widget: Renk oluşturuluyor - R:\(red), G:\(green), B:\(blue), A:\(opacity) from \(hex)")
        
        self.init(.sRGB, red: red, green: green, blue: blue, opacity: opacity)
    }
}


