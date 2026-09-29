// GENERATED CODE - DO NOT MODIFY BY HAND

part of 'vote_result.dart';

// **************************************************************************
// JsonSerializableGenerator
// **************************************************************************

VoteResult _$VoteResultFromJson(Map<String, dynamic> json) => VoteResult(
  likeCount: (json['likeCount'] as num).toInt(),
  dislikeCount: (json['dislikeCount'] as num).toInt(),
  viewCount: (json['viewCount'] as num).toInt(),
  myVote: json['myVote'],
);

Map<String, dynamic> _$VoteResultToJson(VoteResult instance) =>
    <String, dynamic>{
      'likeCount': instance.likeCount,
      'dislikeCount': instance.dislikeCount,
      'viewCount': instance.viewCount,
      'myVote': instance.myVote,
    };
