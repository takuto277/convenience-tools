# Terminal.app で、コマンドを叩いたそのタブ/ウィンドウだけ背景色・文字色・カーソル色を変える。
# 使い方: ~/.zshrc から `source ~/Repository/convenience-tools/shell-utils/ch_term_color.sh`
# その後シェルで `termcolor` と打つと色の選択リストが出る。
# 参考: https://advweb.seesaa.net/article/10308927.html

termcolor() {
  if [ "$TERM_PROGRAM" != "Apple_Terminal" ]; then
    echo "termcolor: Terminal.app 以外では未対応です (現在: ${TERM_PROGRAM:-unknown})" >&2
    return 1
  fi

  # main/subは同じ色相(iOS=青, Android=緑, web=紫)で明度違い。
  # mainより背景を明るくしてmain/subを見分けやすくし、文字色はmain/subともに白で統一
  local names=(ios-main ios-sub android-main android-sub web-main web-sub)
  local bgs=(
    "{0, 0, 26000, 0}"
    "{10000, 11500, 32000, 0}"
    "{0, 20000, 0, 0}"
    "{9000, 26000, 9000, 0}"
    "{22000, 0, 28000, 0}"
    "{26000, 10000, 31000, 0}"
  )
  local fgs=(
    "{65535, 65535, 65535, 0}"
    "{65535, 65535, 65535, 0}"
    "{65535, 65535, 65535, 0}"
    "{65535, 65535, 65535, 0}"
    "{65535, 65535, 65535, 0}"
    "{65535, 65535, 65535, 0}"
  )
  local cursors=(
    "{65535, 65535, 0, 0}"
    "{65535, 65535, 0, 0}"
    "{65535, 65535, 0, 0}"
    "{65535, 65535, 0, 0}"
    "{65535, 65535, 0, 0}"
    "{65535, 65535, 0, 0}"
  )

  echo "色を選んでください:"
  local i
  for i in {1..${#names[@]}}; do
    printf "  %d) %s\n" "$i" "${names[$i]}"
  done

  local choice
  read "choice?番号を入力: "

  if ! [[ "$choice" =~ ^[0-9]+$ ]] || (( choice < 1 || choice > ${#names[@]} )); then
    echo "termcolor: 無効な選択です" >&2
    return 1
  fi

  local bg="${bgs[$choice]}"
  local fg="${fgs[$choice]}"
  local cursor="${cursors[$choice]}"
  local target_tty="$TTY"

  osascript <<EOF
tell application "Terminal"
  repeat with w in windows
    repeat with t in tabs of w
      if tty of t is "$target_tty" then
        set background color of t to $bg
        set normal text color of t to $fg
        set cursor color of t to $cursor
      end if
    end repeat
  end repeat
end tell
EOF
}
